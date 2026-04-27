<template>
  <div class="app">
    <header class="top-nav">
      <div class="nav-container">
        <div class="logo">
          <h1>{{ t('nav.companyName') }}</h1>
          <span class="subtitle">{{ t('nav.subtitle') }}</span>
        </div>
        <nav class="nav-tabs">
          <router-link to="/" :class="{ active: $route.path === '/' }">
            {{ t('nav.overview') }}
          </router-link>
          <router-link to="/inventory" :class="{ active: $route.path === '/inventory' }">
            {{ t('nav.inventory') }}
          </router-link>
          <router-link to="/orders" :class="{ active: $route.path === '/orders' }">
            {{ t('nav.orders') }}
          </router-link>
          <router-link to="/spending" :class="{ active: $route.path === '/spending' }">
            {{ t('nav.finance') }}
          </router-link>
          <router-link to="/demand" :class="{ active: $route.path === '/demand' }">
            {{ t('nav.demandForecast') }}
          </router-link>
          <router-link to="/reports" :class="{ active: $route.path === '/reports' }">
            {{ t('nav.reports') }}
          </router-link>
          <router-link to="/restocking" :class="{ active: $route.path === '/restocking' }">
            {{ t('nav.restocking') }}
          </router-link>
        </nav>
        <button
          class="theme-toggle"
          @click="toggleTheme"
          :title="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
          :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
        >
          <!-- Sun icon (shown in dark mode to switch to light) -->
          <svg v-if="isDark" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="5"/>
            <line x1="12" y1="1" x2="12" y2="3"/>
            <line x1="12" y1="21" x2="12" y2="23"/>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
            <line x1="1" y1="12" x2="3" y2="12"/>
            <line x1="21" y1="12" x2="23" y2="12"/>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
          </svg>
          <!-- Moon icon (shown in light mode to switch to dark) -->
          <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
          </svg>
        </button>
        <LanguageSwitcher />
        <ProfileMenu
          @show-profile-details="showProfileDetails = true"
          @show-tasks="showTasks = true"
        />
      </div>
    </header>
    <FilterBar />
    <main class="main-content">
      <router-view />
    </main>

    <ProfileDetailsModal
      :is-open="showProfileDetails"
      @close="showProfileDetails = false"
    />

    <TasksModal
      :is-open="showTasks"
      :tasks="tasks"
      @close="showTasks = false"
      @add-task="addTask"
      @delete-task="deleteTask"
      @toggle-task="toggleTask"
    />
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { api } from './api'
import { useAuth } from './composables/useAuth'
import { useI18n } from './composables/useI18n'
import FilterBar from './components/FilterBar.vue'
import ProfileMenu from './components/ProfileMenu.vue'
import ProfileDetailsModal from './components/ProfileDetailsModal.vue'
import TasksModal from './components/TasksModal.vue'
import LanguageSwitcher from './components/LanguageSwitcher.vue'

export default {
  name: 'App',
  components: {
    FilterBar,
    ProfileMenu,
    ProfileDetailsModal,
    TasksModal,
    LanguageSwitcher
  },
  setup() {
    const { currentUser } = useAuth()
    const { t } = useI18n()
    const showProfileDetails = ref(false)
    const showTasks = ref(false)
    const apiTasks = ref([])

    // Dark mode
    const isDark = ref(false)

    const applyTheme = (dark) => {
      document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light')
    }

    const toggleTheme = () => {
      isDark.value = !isDark.value
      applyTheme(isDark.value)
      localStorage.setItem('meridian-theme', isDark.value ? 'dark' : 'light')
    }

    // Merge mock tasks from currentUser with API tasks
    const tasks = computed(() => {
      return [...currentUser.value.tasks, ...apiTasks.value]
    })

    const loadTasks = async () => {
      try {
        apiTasks.value = await api.getTasks()
      } catch (err) {
        console.error('Failed to load tasks:', err)
      }
    }

    const addTask = async (taskData) => {
      try {
        const newTask = await api.createTask(taskData)
        // Add new task to the beginning of the array
        apiTasks.value.unshift(newTask)
      } catch (err) {
        console.error('Failed to add task:', err)
      }
    }

    const deleteTask = async (taskId) => {
      try {
        // Check if it's a mock task (from currentUser)
        const isMockTask = currentUser.value.tasks.some(t => t.id === taskId)

        if (isMockTask) {
          // Remove from mock tasks
          const index = currentUser.value.tasks.findIndex(t => t.id === taskId)
          if (index !== -1) {
            currentUser.value.tasks.splice(index, 1)
          }
        } else {
          // Remove from API tasks
          await api.deleteTask(taskId)
          apiTasks.value = apiTasks.value.filter(t => t.id !== taskId)
        }
      } catch (err) {
        console.error('Failed to delete task:', err)
      }
    }

    const toggleTask = async (taskId) => {
      try {
        // Check if it's a mock task (from currentUser)
        const mockTask = currentUser.value.tasks.find(t => t.id === taskId)

        if (mockTask) {
          // Toggle mock task status
          mockTask.status = mockTask.status === 'pending' ? 'completed' : 'pending'
        } else {
          // Toggle API task
          const updatedTask = await api.toggleTask(taskId)
          const index = apiTasks.value.findIndex(t => t.id === taskId)
          if (index !== -1) {
            apiTasks.value[index] = updatedTask
          }
        }
      } catch (err) {
        console.error('Failed to toggle task:', err)
      }
    }

    onMounted(() => {
      loadTasks()
      // Restore saved theme preference
      const saved = localStorage.getItem('meridian-theme')
      if (saved === 'dark') {
        isDark.value = true
        applyTheme(true)
      } else {
        applyTheme(false)
      }
    })

    return {
      t,
      showProfileDetails,
      showTasks,
      tasks,
      addTask,
      deleteTask,
      toggleTask,
      isDark,
      toggleTheme
    }
  }
}
</script>

<style>
/* ============================================================
   CSS Custom Properties — Light (default) and Dark themes
   ============================================================ */
:root,
[data-theme="light"] {
  /* Backgrounds */
  --bg-page:        #F8FAFC;
  --bg-nav:         #ffffff;
  --bg-card:        #ffffff;
  --bg-card-alt:    #F8FAFC;
  --bg-filter-bar:  #F8FAFC;
  --bg-input:       #ffffff;
  --bg-hover:       #F1F5F9;
  --bg-hover-blue:  #EFF6FF;
  --bg-table-head:  #F8FAFC;
  --bg-table-hover: #F8FAFC;

  /* Text */
  --text-primary:   #0F172A;
  --text-secondary: #334155;
  --text-muted:     #64748B;
  --text-faint:     #94A3B8;
  --text-link:      #2563EB;

  /* Borders */
  --border-color:   #E2E8F0;
  --border-strong:  #CBD5E1;

  /* Primary brand */
  --primary:        #3B82F6;
  --primary-dark:   #2563EB;
  --primary-bg:     #EFF6FF;
  --primary-text:   #1E40AF;

  /* Semantic colours (kept fixed — they convey meaning) */
  --color-success:  #059669;
  --color-warning:  #EA580C;
  --color-danger:   #DC2626;
  --color-info:     #2563EB;

  /* Shadows */
  --shadow-sm:  0 1px 3px 0 rgba(0, 0, 0, 0.06);
  --shadow-md:  0 4px 12px rgba(0, 0, 0, 0.08);
  --shadow-lg:  0 10px 25px rgba(0, 0, 0, 0.10);

  /* Nav gradient */
  --nav-gradient: linear-gradient(180deg, #ffffff 0%, #fafcff 100%);
}

[data-theme="dark"] {
  --bg-page:        #0F172A;
  --bg-nav:         #1E293B;
  --bg-card:        #1E293B;
  --bg-card-alt:    #0F172A;
  --bg-filter-bar:  #1E293B;
  --bg-input:       #0F172A;
  --bg-hover:       #334155;
  --bg-hover-blue:  #1E3A5F;
  --bg-table-head:  #0F172A;
  --bg-table-hover: #263450;

  --text-primary:   #F1F5F9;
  --text-secondary: #CBD5E1;
  --text-muted:     #94A3B8;
  --text-faint:     #64748B;
  --text-link:      #60A5FA;

  --border-color:   #334155;
  --border-strong:  #475569;

  --primary:        #3B82F6;
  --primary-dark:   #60A5FA;
  --primary-bg:     #1E3A5F;
  --primary-text:   #93C5FD;

  --color-success:  #34D399;
  --color-warning:  #FB923C;
  --color-danger:   #F87171;
  --color-info:     #60A5FA;

  --shadow-sm:  0 1px 3px 0 rgba(0, 0, 0, 0.30);
  --shadow-md:  0 4px 12px rgba(0, 0, 0, 0.40);
  --shadow-lg:  0 10px 25px rgba(0, 0, 0, 0.50);

  --nav-gradient: linear-gradient(180deg, #1E293B 0%, #172032 100%);
}

/* ============================================================
   Global reset & base
   ============================================================ */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  background: var(--bg-page);
  color: var(--text-primary);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  line-height: 1.5;
  transition: background 0.2s ease, color 0.2s ease;
}

.app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

/* ============================================================
   Navigation
   ============================================================ */
.top-nav {
  background: var(--nav-gradient);
  border-bottom: 1px solid var(--border-color);
  box-shadow: var(--shadow-sm);
  position: sticky;
  top: 0;
  z-index: 100;
  transition: background 0.2s ease, border-color 0.2s ease;
}

.nav-container {
  max-width: 1600px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  padding: 0 2rem;
  height: 70px;
  gap: 0.75rem;
}

.nav-container > .nav-tabs {
  margin-left: auto;
}

.logo {
  display: flex;
  align-items: baseline;
  gap: 0.75rem;
  flex-shrink: 0;
}

.logo h1 {
  font-size: 1.375rem;
  font-weight: 800;
  color: var(--text-primary);
  letter-spacing: -0.03em;
}

.subtitle {
  font-size: 0.813rem;
  color: var(--text-muted);
  font-weight: 400;
  padding-left: 0.75rem;
  border-left: 1px solid var(--border-color);
}

.nav-tabs {
  display: flex;
  gap: 0.25rem;
}

.nav-tabs a {
  padding: 0.5rem 1rem;
  color: var(--text-muted);
  text-decoration: none;
  font-weight: 500;
  font-size: 0.875rem;
  border-radius: 8px;
  transition: color 0.18s ease, background 0.18s ease;
  position: relative;
  white-space: nowrap;
}

.nav-tabs a:hover {
  color: var(--text-primary);
  background: var(--bg-hover);
}

.nav-tabs a.active {
  color: var(--primary);
  background: var(--primary-bg);
  font-weight: 600;
}

.nav-tabs a.active::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  right: 0;
  height: 2px;
  background: var(--primary);
  border-radius: 2px 2px 0 0;
}

/* ============================================================
   Theme toggle button
   ============================================================ */
.theme-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  padding: 0;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  color: var(--text-muted);
  cursor: pointer;
  transition: background 0.18s ease, border-color 0.18s ease, color 0.18s ease, transform 0.15s ease;
  flex-shrink: 0;
}

.theme-toggle:hover {
  background: var(--bg-hover);
  border-color: var(--border-strong);
  color: var(--text-primary);
  transform: scale(1.05);
}

/* ============================================================
   Main content
   ============================================================ */
.main-content {
  flex: 1;
  max-width: 1600px;
  width: 100%;
  margin: 0 auto;
  padding: 1.5rem 2rem;
}

/* ============================================================
   Page header
   ============================================================ */
.page-header {
  margin-bottom: 1.5rem;
}

.page-header h2 {
  font-size: 1.875rem;
  font-weight: 800;
  color: var(--text-primary);
  margin-bottom: 0.375rem;
  letter-spacing: -0.03em;
  line-height: 1.2;
}

.page-header p {
  color: var(--text-muted);
  font-size: 0.938rem;
  line-height: 1.6;
}

/* ============================================================
   Stats grid
   ============================================================ */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.25rem;
  margin-bottom: 1.5rem;
}

.stat-card {
  background: var(--bg-card);
  padding: 1.375rem;
  border-radius: 12px;
  border: 1px solid var(--border-color);
  box-shadow: var(--shadow-sm);
  transition: border-color 0.18s ease, box-shadow 0.18s ease, background 0.2s ease;
}

.stat-card:hover {
  border-color: var(--border-strong);
  box-shadow: var(--shadow-md);
}

.stat-label {
  color: var(--text-muted);
  font-size: 0.813rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 0.625rem;
}

.stat-value {
  font-size: 2.25rem;
  font-weight: 800;
  color: var(--text-primary);
  letter-spacing: -0.03em;
  line-height: 1.1;
}

.stat-card.warning .stat-value { color: var(--color-warning); }
.stat-card.success .stat-value { color: var(--color-success); }
.stat-card.danger  .stat-value { color: var(--color-danger);  }
.stat-card.info    .stat-value { color: var(--color-info);    }

/* ============================================================
   Cards
   ============================================================ */
.card {
  background: var(--bg-card);
  border-radius: 12px;
  padding: 1.375rem;
  border: 1px solid var(--border-color);
  box-shadow: var(--shadow-sm);
  margin-bottom: 1.25rem;
  transition: background 0.2s ease, border-color 0.2s ease;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.875rem;
  border-bottom: 1px solid var(--border-color);
}

.card-title {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: -0.02em;
}

/* ============================================================
   Tables
   ============================================================ */
.table-container {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
}

thead {
  background: var(--bg-table-head);
  border-top: 1px solid var(--border-color);
  border-bottom: 1px solid var(--border-color);
}

th {
  text-align: left;
  padding: 0.625rem 0.875rem;
  font-weight: 700;
  color: var(--text-muted);
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

td {
  padding: 0.625rem 0.875rem;
  border-top: 1px solid var(--border-color);
  color: var(--text-secondary);
  font-size: 0.875rem;
  line-height: 1.5;
}

tbody tr {
  transition: background-color 0.13s ease;
}

tbody tr:hover {
  background: var(--bg-table-hover);
}

/* ============================================================
   Badges
   ============================================================ */
.badge {
  display: inline-block;
  padding: 0.25rem 0.688rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.badge.success    { background: #d1fae5; color: #065f46; }
.badge.warning    { background: #fed7aa; color: #92400e; }
.badge.danger     { background: #fecaca; color: #991b1b; }
.badge.info       { background: #dbeafe; color: #1e40af; }
.badge.increasing { background: #d1fae5; color: #065f46; }
.badge.decreasing { background: #fecaca; color: #991b1b; }
.badge.stable     { background: #e0e7ff; color: #3730a3; }
.badge.high       { background: #fecaca; color: #991b1b; }
.badge.medium     { background: #fed7aa; color: #92400e; }
.badge.low        { background: #dbeafe; color: #1e40af; }

[data-theme="dark"] .badge.success    { background: #064e3b; color: #6ee7b7; }
[data-theme="dark"] .badge.warning    { background: #431407; color: #fdba74; }
[data-theme="dark"] .badge.danger     { background: #450a0a; color: #fca5a5; }
[data-theme="dark"] .badge.info       { background: #1e3a5f; color: #93c5fd; }
[data-theme="dark"] .badge.increasing { background: #064e3b; color: #6ee7b7; }
[data-theme="dark"] .badge.decreasing { background: #450a0a; color: #fca5a5; }
[data-theme="dark"] .badge.stable     { background: #1e1b4b; color: #a5b4fc; }
[data-theme="dark"] .badge.high       { background: #450a0a; color: #fca5a5; }
[data-theme="dark"] .badge.medium     { background: #431407; color: #fdba74; }
[data-theme="dark"] .badge.low        { background: #1e3a5f; color: #93c5fd; }

/* ============================================================
   Loading / error states
   ============================================================ */
.loading {
  text-align: center;
  padding: 3rem;
  color: var(--text-muted);
  font-size: 0.938rem;
}

.error {
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #991b1b;
  padding: 1rem;
  border-radius: 10px;
  margin: 1rem 0;
  font-size: 0.938rem;
}

[data-theme="dark"] .error {
  background: #450a0a;
  border-color: #7f1d1d;
  color: #fca5a5;
}

/* ============================================================
   Buttons — global reusable styles
   ============================================================ */
button {
  font-family: inherit;
}
</style>
