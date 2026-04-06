<script setup lang="ts">
const stats = [
  { title: "Total Students", value: "2,543", change: 12.5, changeLabel: "from last month", icon: "users", color: "primary" as const },
  { title: "Active Courses", value: "48", change: 4.2, changeLabel: "from last month", icon: "book-open", color: "success" as const },
  { title: "Enrollments", value: "1,423", change: 24.4, changeLabel: "from last month", icon: "academic-cap", color: "warning" as const },
  { title: "Completion Rate", value: "83.5%", change: 1.5, changeLabel: "from last month", icon: "trending-up", color: "primary" as const },
];

// Chart Data
const enrollmentSeries = ref([
  {
    name: "Enrollments",
    data: [31, 40, 28, 51, 42, 109, 100],
  },
]);

const enrollmentChartOptions = ref({
  chart: {
    type: "area",
    toolbar: { show: false },
    fontFamily: "Plus Jakarta Sans, sans-serif",
  },
  dataLabels: { enabled: false },
  stroke: { curve: "smooth", width: 2 },
  xaxis: {
    categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"],
    labels: { style: { colors: "#64748b" } },
    axisBorder: { show: false },
    axisTicks: { show: false },
  },
  yaxis: {
    labels: { style: { colors: "#64748b" } },
  },
  grid: {
    borderColor: "#e2e8f0",
    strokeDashArray: 4,
  },
  colors: ["#5D87FF"],
  fill: {
    type: "gradient",
    gradient: {
      shadeIntensity: 1,
      opacityFrom: 0.7,
      opacityTo: 0.1,
      stops: [0, 90, 100],
    },
  },
});

// Yearly Breakup Donut Chart
const yearlyBreakupSeries = ref([38, 40, 25]);
const yearlyBreakupOptions = ref({
  chart: {
    type: "donut",
    fontFamily: "Plus Jakarta Sans, sans-serif",
  },
  labels: ["Videos", "Quizzes", "Assignments"],
  colors: ["#5D87FF", "#49BEFF", "#FA896B"],
  legend: {
    show: true,
    position: "bottom",
    labels: { colors: "#64748b" },
  },
  plotOptions: {
    pie: {
      donut: {
        size: "70%",
        labels: {
          show: true,
          total: {
            show: true,
            label: "Total",
            color: "#64748b",
          },
        },
      },
    },
  },
  dataLabels: { enabled: false },
});

// Monthly Earnings Chart
const monthlyEarningsSeries = ref([
  { name: "Revenue", data: [25, 66, 41, 89, 63, 25, 44, 12, 36, 9, 54] },
]);
const monthlyEarningsOptions = ref({
  chart: {
    type: "area",
    toolbar: { show: false },
    fontFamily: "Plus Jakarta Sans, sans-serif",
    sparkline: { enabled: true },
  },
  stroke: { curve: "smooth", width: 2 },
  colors: ["#49BEFF"],
  fill: {
    type: "gradient",
    gradient: {
      shadeIntensity: 1,
      opacityFrom: 0.5,
      opacityTo: 0.1,
      stops: [0, 90, 100],
    },
  },
});

// Top Courses
const topCourses = [
  { name: "Vue 3 Masterclass", instructor: "Ahmad Fauzi", students: 543, progress: 85, color: "bg-primary-500" },
  { name: "Advanced Python", instructor: "Budi Santoso", students: 421, progress: 72, color: "bg-cyan-500" },
  { name: "UI/UX Design", instructor: "Citra Dewi", students: 387, progress: 90, color: "bg-emerald-500" },
  { name: "React 18 Complete", instructor: "Dian Pratama", students: 298, progress: 65, color: "bg-amber-500" },
];

const coursePopSeries = ref([
  {
    name: "Views",
    data: [400, 430, 448, 470, 540],
  },
]);

const coursePopChartOptions = ref({
  chart: {
    type: "bar",
    toolbar: { show: false },
    fontFamily: "Plus Jakarta Sans, sans-serif",
  },
  plotOptions: {
    bar: {
      borderRadius: 4,
      horizontal: true,
      barHeight: "50%",
    },
  },
  dataLabels: { enabled: false },
  xaxis: {
    categories: ["Intro to Go", "Vue 3 Masterclass", "UI/UX Design", "Advanced Python", "React 18"],
    labels: { style: { colors: "#64748b" } },
  },
  yaxis: {
    labels: { style: { colors: "#64748b" } },
  },
  grid: { show: false },
  colors: ["#5D87FF"],
});
</script>

<template>
  <div class="w-full space-y-6 animate-fade-in">
    <!-- Page header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-slate-900 dark:text-white">Dashboard</h1>
        <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Welcome back! Here's an overview of your learning platform.
        </p>
      </div>
      <UiButton variant="elevated" color="primary">
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
        </svg>
        New Course
      </UiButton>
    </div>

    <!-- Stats grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <DashboardStatsCard
        v-for="stat in stats"
        :key="stat.title"
        :title="stat.title"
        :value="stat.value"
        :change="stat.change"
        :change-label="stat.changeLabel"
        :icon="stat.icon"
        :color="stat.color"
      />
    </div>

    <!-- Charts row - 3 columns layout -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Enrollment Trends - Takes 2 columns -->
      <div class="lg:col-span-2">
        <DashboardChartCard
          title="Enrollment Trends"
          subtitle="Monthly enrollments for the current year"
        >
          <template #actions>
            <select class="text-sm bg-transparent border-0 text-slate-600 dark:text-slate-400 focus:ring-0 cursor-pointer">
              <option>This Year</option>
              <option>Last Year</option>
            </select>
          </template>
          <UiChart 
              type="area" 
              height="100%" 
              :series="enrollmentSeries" 
              :options="enrollmentChartOptions" 
          />
        </DashboardChartCard>
      </div>

      <!-- Yearly Breakup - 1 column -->
      <UiCard>
        <template #header>
          <h3 class="font-semibold text-slate-900 dark:text-white">Yearly Breakup</h3>
        </template>
        <div class="flex flex-col items-center">
          <UiChart 
            type="donut" 
            height="220" 
            :series="yearlyBreakupSeries" 
            :options="yearlyBreakupOptions" 
          />
          <div class="text-center mt-4">
            <p class="text-2xl font-bold text-slate-900 dark:text-white">$36,358</p>
            <p class="text-sm text-slate-500">Total Revenue</p>
          </div>
        </div>
      </UiCard>
    </div>

    <!-- Second charts row -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Monthly Earnings -->
      <UiCard>
        <template #header>
          <h3 class="font-semibold text-slate-900 dark:text-white">Monthly Earnings</h3>
        </template>
        <div class="space-y-4">
          <div>
            <p class="text-3xl font-bold text-slate-900 dark:text-white">$6,820</p>
            <p class="text-sm text-emerald-500 flex items-center gap-1">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
              +9% from last month
            </p>
          </div>
          <UiChart 
            type="area" 
            height="120" 
            :series="monthlyEarningsSeries" 
            :options="monthlyEarningsOptions" 
          />
        </div>
      </UiCard>

      <!-- Top Courses - Takes 2 columns -->
      <div class="lg:col-span-2">
        <UiCard>
          <template #header>
            <div class="flex items-center justify-between">
              <h3 class="font-semibold text-slate-900 dark:text-white">Top Courses</h3>
              <select class="text-sm bg-transparent border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-1.5 text-slate-600 dark:text-slate-400 focus:ring-primary-500">
                <option>This Month</option>
                <option>Last Month</option>
              </select>
            </div>
          </template>
          <div class="space-y-4">
            <div 
              v-for="course in topCourses" 
              :key="course.name"
              class="flex items-center gap-4"
            >
              <div :class="['w-2 h-10 rounded-full', course.color]"></div>
              <div class="flex-1 min-w-0">
                <p class="font-medium text-slate-900 dark:text-white truncate">{{ course.name }}</p>
                <p class="text-sm text-slate-500 dark:text-slate-400">{{ course.instructor }}</p>
              </div>
              <div class="text-right">
                <p class="font-semibold text-slate-900 dark:text-white">{{ course.students }}</p>
                <p class="text-xs text-slate-500">students</p>
              </div>
              <div class="w-24">
                <div class="flex justify-between text-xs mb-1">
                  <span class="text-slate-500">Progress</span>
                  <span class="font-medium text-slate-700 dark:text-slate-300">{{ course.progress }}%</span>
                </div>
                <div class="h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div :class="['h-full rounded-full', course.color]" :style="{ width: course.progress + '%' }"></div>
                </div>
              </div>
            </div>
          </div>
        </UiCard>
      </div>
    </div>

    <!-- Course Popularity Chart -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <DashboardChartCard
        title="Course Popularity"
        subtitle="Most visited courses by students"
      >
        <UiChart 
            type="bar" 
            height="100%" 
            :series="coursePopSeries" 
            :options="coursePopChartOptions" 
        />
      </DashboardChartCard>

      <!-- Recent activity -->
      <DashboardRecentActivity />
    </div>

    <!-- Quick Actions -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

      <!-- Quick actions -->
      <UiCard>
        <template #header>
          <h3 class="font-semibold text-slate-900 dark:text-white">Quick Actions</h3>
        </template>
        <div class="space-y-3">
          <button class="w-full flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors text-left">
            <div class="p-2 rounded-lg bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <div>
              <p class="font-medium text-slate-900 dark:text-white">Create Course</p>
              <p class="text-xs text-slate-500 dark:text-slate-400">Add a new course curriculum</p>
            </div>
          </button>
          <button class="w-full flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors text-left">
            <div class="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            <div>
              <p class="font-medium text-slate-900 dark:text-white">Register Student</p>
              <p class="text-xs text-slate-500 dark:text-slate-400">Manually enroll a student</p>
            </div>
          </button>
          <button class="w-full flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors text-left">
            <div class="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <p class="font-medium text-slate-900 dark:text-white">View Reports</p>
              <p class="text-xs text-slate-500 dark:text-slate-400">Export student progress data</p>
            </div>
          </button>
        </div>
      </UiCard>

      <!-- Upcoming Events - Takes 2 columns -->
      <div class="lg:col-span-2">
        <UiCard>
          <template #header>
            <div class="flex items-center justify-between">
              <h3 class="font-semibold text-slate-900 dark:text-white">Upcoming Events</h3>
              <a href="#" class="text-sm text-primary-500 hover:text-primary-600">View All</a>
            </div>
          </template>
          <div class="space-y-4">
            <div class="flex items-center gap-4 p-3 rounded-xl bg-primary-50 dark:bg-primary-950/30 border-l-4 border-primary-500">
              <div class="text-center">
                <p class="text-2xl font-bold text-primary-600 dark:text-primary-400">15</p>
                <p class="text-xs text-primary-500">JAN</p>
              </div>
              <div class="flex-1">
                <p class="font-medium text-slate-900 dark:text-white">Final Exam: Advanced Python</p>
                <p class="text-sm text-slate-500 dark:text-slate-400">10:00 AM - 12:00 PM • Room 301</p>
              </div>
              <span class="px-2.5 py-1 text-xs font-medium bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 rounded-full">Exam</span>
            </div>
            <div class="flex items-center gap-4 p-3 rounded-xl bg-cyan-50 dark:bg-cyan-950/30 border-l-4 border-cyan-500">
              <div class="text-center">
                <p class="text-2xl font-bold text-cyan-600 dark:text-cyan-400">18</p>
                <p class="text-xs text-cyan-500">JAN</p>
              </div>
              <div class="flex-1">
                <p class="font-medium text-slate-900 dark:text-white">Live Webinar: Vue 3 Best Practices</p>
                <p class="text-sm text-slate-500 dark:text-slate-400">2:00 PM - 4:00 PM • Online</p>
              </div>
              <span class="px-2.5 py-1 text-xs font-medium bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400 rounded-full">Webinar</span>
            </div>
            <div class="flex items-center gap-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border-l-4 border-emerald-500">
              <div class="text-center">
                <p class="text-2xl font-bold text-emerald-600 dark:text-emerald-400">22</p>
                <p class="text-xs text-emerald-500">JAN</p>
              </div>
              <div class="flex-1">
                <p class="font-medium text-slate-900 dark:text-white">Assignment Due: UI/UX Project</p>
                <p class="text-sm text-slate-500 dark:text-slate-400">11:59 PM • Online Submission</p>
              </div>
              <span class="px-2.5 py-1 text-xs font-medium bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-full">Assignment</span>
            </div>
            <div class="flex items-center gap-4 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border-l-4 border-amber-500">
              <div class="text-center">
                <p class="text-2xl font-bold text-amber-600 dark:text-amber-400">25</p>
                <p class="text-xs text-amber-500">JAN</p>
              </div>
              <div class="flex-1">
                <p class="font-medium text-slate-900 dark:text-white">Workshop: React 18 New Features</p>
                <p class="text-sm text-slate-500 dark:text-slate-400">9:00 AM - 5:00 PM • Lab Room A</p>
              </div>
              <span class="px-2.5 py-1 text-xs font-medium bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400 rounded-full">Workshop</span>
            </div>
          </div>
        </UiCard>
      </div>
    </div>
  </div>
</template>
