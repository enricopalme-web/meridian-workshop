<template>
  <div class="restocking">
    <div class="page-header">
      <h2>{{ t('restocking.title') }}</h2>
      <p>{{ t('restocking.description') }}</p>
    </div>

    <!-- Controls -->
    <div class="controls-card">
      <div class="controls-row">
        <div class="control-group">
          <label class="control-label">{{ t('restocking.budgetLabel') }}</label>
          <div class="budget-input-row">
            <span class="currency-symbol">{{ currencySymbol }}</span>
            <input
              v-model.number="budgetInput"
              type="number"
              min="0"
              class="budget-input"
              :placeholder="t('restocking.budgetPlaceholder')"
              @keydown.enter="applyBudget"
            />
            <button class="btn btn-primary" @click="applyBudget">{{ t('restocking.applyBudget') }}</button>
            <button v-if="activeBudget" class="btn btn-secondary" @click="clearBudget">{{ t('restocking.clearBudget') }}</button>
          </div>
        </div>
        <div class="control-group">
          <label class="control-label">{{ t('filters.location') }}</label>
          <select v-model="selectedWarehouse" class="warehouse-select">
            <option value="all">{{ t('restocking.allWarehouses') }}</option>
            <option v-for="wh in warehouses" :key="wh" :value="wh">{{ wh }}</option>
          </select>
        </div>
      </div>
      <div v-if="activeBudget" class="budget-badge">
        {{ currencySymbol }}{{ activeBudget.toLocaleString() }} budget active
      </div>
    </div>

    <div v-if="loading" class="loading">{{ t('common.loading') }}</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else>
      <!-- Summary Stats -->
      <div class="stats-grid" v-if="recommendations.length > 0">
        <div class="stat-card">
          <div class="stat-label">{{ t('restocking.summary.itemsRecommended') }}</div>
          <div class="stat-value">{{ recommendations.length }}</div>
        </div>
        <div class="stat-card warning">
          <div class="stat-label">{{ t('restocking.summary.totalEstimatedCost') }}</div>
          <div class="stat-value">{{ formatCurrency(totalEstimatedCost) }}</div>
        </div>
        <div class="stat-card" :class="activeBudget ? 'success' : ''">
          <div class="stat-label">{{ t('restocking.summary.budgetRemaining') }}</div>
          <div class="stat-value">{{ activeBudget ? formatCurrency(budgetRemaining) : '—' }}</div>
        </div>
        <div class="stat-card danger">
          <div class="stat-label">{{ t('restocking.summary.criticalItems') }}</div>
          <div class="stat-value">{{ criticalCount }}</div>
        </div>
      </div>

      <!-- Empty state -->
      <div v-if="recommendations.length === 0" class="empty-state">
        <div class="empty-icon">✓</div>
        <p>{{ t('restocking.noRecommendations') }}</p>
      </div>

      <!-- Recommendations table -->
      <div v-else class="card">
        <div class="table-container">
          <table class="restocking-table">
            <thead>
              <tr>
                <th>{{ t('restocking.table.sku') }}</th>
                <th>{{ t('restocking.table.name') }}</th>
                <th>{{ t('restocking.table.warehouse') }}</th>
                <th class="num">{{ t('restocking.table.onHand') }}</th>
                <th class="num">{{ t('restocking.table.forecasted') }}</th>
                <th class="num">{{ t('restocking.table.recommendedQty') }}</th>
                <th class="num">{{ t('restocking.table.unitCost') }}</th>
                <th class="num">{{ t('restocking.table.estimatedCost') }}</th>
                <th>{{ t('restocking.table.criticality') }}</th>
                <th>{{ t('restocking.table.trend') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="rec in recommendations" :key="rec.sku + rec.warehouse">
                <td><strong>{{ rec.sku }}</strong></td>
                <td>{{ rec.name }}</td>
                <td>{{ rec.warehouse }}</td>
                <td class="num">{{ rec.quantity_on_hand }}</td>
                <td class="num">{{ rec.forecasted_demand }}</td>
                <td class="num"><strong>{{ rec.recommended_qty }}</strong></td>
                <td class="num">{{ formatCurrency(rec.unit_cost) }}</td>
                <td class="num"><strong>{{ formatCurrency(rec.estimated_cost) }}</strong></td>
                <td>
                  <div class="criticality-bar-wrap">
                    <div class="criticality-bar" :style="{ width: rec.criticality_pct + '%' }" :class="getCriticalityClass(rec.criticality_pct)"></div>
                    <span class="criticality-label" :class="getCriticalityClass(rec.criticality_pct)">{{ rec.criticality_pct }}%</span>
                  </div>
                </td>
                <td>
                  <span :class="['trend-badge', rec.trend]">{{ rec.trend }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch, onMounted } from 'vue'
import { api } from '../api'
import { useI18n } from '../composables/useI18n'

export default {
  name: 'Restocking',
  setup() {
    const { t, currentLocale, currentCurrency } = useI18n()

    const loading = ref(false)
    const error = ref(null)
    const recommendations = ref([])
    const budgetInput = ref(null)
    const activeBudget = ref(null)
    const selectedWarehouse = ref('all')

    const warehouses = ['San Francisco', 'London', 'Tokyo']

    const currencySymbol = computed(() =>
      currentCurrency.value === 'JPY' ? '¥' : '$'
    )

    const totalEstimatedCost = computed(() =>
      recommendations.value.reduce((sum, r) => sum + r.estimated_cost, 0)
    )

    const budgetRemaining = computed(() =>
      activeBudget.value ? activeBudget.value - totalEstimatedCost.value : null
    )

    const criticalCount = computed(() =>
      recommendations.value.filter(r => r.criticality_pct > 75).length
    )

    const loadRecommendations = async () => {
      try {
        loading.value = true
        error.value = null
        const filters = {
          budget: activeBudget.value,
          warehouse: selectedWarehouse.value
        }
        recommendations.value = await api.getRestockingRecommendations(filters)
      } catch (err) {
        error.value = t('common.error') + ': ' + err.message
      } finally {
        loading.value = false
      }
    }

    const applyBudget = () => {
      activeBudget.value = budgetInput.value > 0 ? budgetInput.value : null
      loadRecommendations()
    }

    const clearBudget = () => {
      budgetInput.value = null
      activeBudget.value = null
      loadRecommendations()
    }

    watch(selectedWarehouse, loadRecommendations)
    onMounted(loadRecommendations)

    const formatCurrency = (value) => {
      const locale = currentLocale.value === 'ja' ? 'ja-JP' : 'en-US'
      return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currentCurrency.value,
        maximumFractionDigits: 0
      }).format(value)
    }

    const getCriticalityClass = (pct) => {
      if (pct > 75) return 'critical'
      if (pct > 40) return 'medium'
      return 'low'
    }

    return {
      t,
      loading,
      error,
      recommendations,
      budgetInput,
      activeBudget,
      selectedWarehouse,
      warehouses,
      currencySymbol,
      totalEstimatedCost,
      budgetRemaining,
      criticalCount,
      applyBudget,
      clearBudget,
      formatCurrency,
      getCriticalityClass
    }
  }
}
</script>

<style scoped>
.restocking {
  padding: 0;
}

.controls-card {
  background: var(--bg-card);
  border-radius: 12px;
  padding: 1.25rem 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-color);
  transition: background 0.2s ease, border-color 0.2s ease;
}

.controls-row {
  display: flex;
  gap: 2rem;
  align-items: flex-end;
  flex-wrap: wrap;
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.control-label {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.budget-input-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.currency-symbol {
  font-size: 1rem;
  color: var(--text-muted);
  font-weight: 500;
}

.budget-input {
  width: 200px;
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 0.9rem;
  color: var(--text-primary);
  background: var(--bg-input);
  outline: none;
  transition: border-color 0.2s, background 0.2s ease;
}

.budget-input:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
}

.warehouse-select {
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 0.9rem;
  color: var(--text-primary);
  background: var(--bg-input);
  cursor: pointer;
  min-width: 160px;
  transition: background 0.2s ease, color 0.2s ease, border-color 0.2s ease;
}

.btn {
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  border: none;
  transition: background 0.18s ease, transform 0.15s ease, box-shadow 0.15s ease;
}

.btn-primary {
  background: var(--primary);
  color: white;
}

.btn-primary:hover {
  background: var(--primary-dark);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.35);
}

.btn-secondary {
  background: var(--bg-hover);
  color: var(--text-muted);
  border: 1px solid var(--border-color);
}

.btn-secondary:hover {
  background: var(--border-color);
}

.budget-badge {
  margin-top: 0.75rem;
  display: inline-block;
  padding: 0.25rem 0.75rem;
  background: var(--primary-bg);
  color: var(--primary-text);
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  border: 1px solid var(--primary);
  opacity: 0.8;
}

/* Stats */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.stat-card {
  background: var(--bg-card);
  border-radius: 12px;
  padding: 1.25rem 1.5rem;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-color);
  border-left: 4px solid var(--primary);
  transition: background 0.2s ease, border-color 0.2s ease;
}

.stat-card.warning { border-left-color: #f59e0b; }
.stat-card.success { border-left-color: #22c55e; }
.stat-card.danger  { border-left-color: #ef4444; }

.stat-label {
  font-size: 0.8rem;
  color: var(--text-muted);
  margin-bottom: 0.4rem;
  font-weight: 500;
}

.stat-value {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1.1;
}

/* Table */
.card {
  background: var(--bg-card);
  border-radius: 12px;
  padding: 0;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-color);
  overflow: hidden;
  transition: background 0.2s ease, border-color 0.2s ease;
}

.table-container {
  overflow-x: auto;
}

.restocking-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
}

.restocking-table th {
  background: var(--bg-table-head);
  padding: 0.75rem 1rem;
  text-align: left;
  font-weight: 700;
  color: var(--text-muted);
  border-bottom: 2px solid var(--border-color);
  white-space: nowrap;
}

.restocking-table td {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--border-color);
  vertical-align: middle;
  color: var(--text-secondary);
}

.restocking-table tr:last-child td {
  border-bottom: none;
}

.restocking-table tr:hover td {
  background: var(--bg-table-hover);
}

.num {
  text-align: right;
}

/* Criticality bar */
.criticality-bar-wrap {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 120px;
}

.criticality-bar {
  height: 6px;
  border-radius: 3px;
  flex-shrink: 0;
  max-width: 80px;
}

.criticality-bar.critical { background: #ef4444; }
.criticality-bar.medium   { background: #f59e0b; }
.criticality-bar.low      { background: #22c55e; }

.criticality-label {
  font-size: 0.8rem;
  font-weight: 600;
  white-space: nowrap;
}

.criticality-label.critical { color: var(--color-danger); }
.criticality-label.medium   { color: var(--color-warning); }
.criticality-label.low      { color: var(--color-success); }

/* Trend badge */
.trend-badge {
  padding: 0.2rem 0.6rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 500;
  white-space: nowrap;
}

.trend-badge.increasing {
  background: #fef3c7;
  color: #92400e;
}

.trend-badge.stable {
  background: #f0f9ff;
  color: #0369a1;
}

.trend-badge.decreasing {
  background: #f0fdf4;
  color: #166534;
}

:global([data-theme="dark"]) .trend-badge.increasing { background: #431407; color: #fdba74; }
:global([data-theme="dark"]) .trend-badge.stable     { background: #0c2a3d; color: #7dd3fc; }
:global([data-theme="dark"]) .trend-badge.decreasing { background: #052e16; color: #86efac; }

/* Empty state */
.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  background: var(--bg-card);
  border-radius: 12px;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-color);
}

.empty-icon {
  font-size: 3rem;
  color: #22c55e;
  margin-bottom: 1rem;
}

.empty-state p {
  color: var(--text-muted);
  font-size: 1rem;
}

.loading {
  text-align: center;
  padding: 3rem;
  color: var(--text-muted);
}

.error {
  background: #fee2e2;
  color: #991b1b;
  padding: 1rem;
  border-radius: 8px;
}

:global([data-theme="dark"]) .restocking .error {
  background: #450a0a;
  color: #fca5a5;
}
</style>
