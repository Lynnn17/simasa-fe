<script setup lang="ts">
/**
 * UiStepper - Vuetify-like stepper component
 * 
 * Features:
 * - Horizontal/Vertical layout
 * - Linear/Non-linear navigation
 * - Step icons and titles
 * - Step validation
 * - Custom content slots
 */

interface Step {
  title: string;
  subtitle?: string;
  icon?: string;
  complete?: boolean;
  error?: boolean;
}

interface Props {
  modelValue: number;
  steps: Step[];
  vertical?: boolean;
  linear?: boolean;
  altLabels?: boolean;
  editable?: boolean;
  color?: 'primary' | 'success' | 'warning' | 'error';
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: 1,
  vertical: false,
  linear: true,
  altLabels: false,
  editable: false,
  color: 'primary',
});

const emit = defineEmits<{
  'update:modelValue': [value: number];
}>();

// Color classes
const colorClasses = computed(() => {
  const colors = {
    primary: {
      active: 'bg-primary-500 text-white',
      completed: 'bg-primary-500 text-white',
      line: 'bg-primary-500',
    },
    success: {
      active: 'bg-green-500 text-white',
      completed: 'bg-green-500 text-white',
      line: 'bg-green-500',
    },
    warning: {
      active: 'bg-yellow-500 text-white',
      completed: 'bg-yellow-500 text-white',
      line: 'bg-yellow-500',
    },
    error: {
      active: 'bg-red-500 text-white',
      completed: 'bg-red-500 text-white',
      line: 'bg-red-500',
    },
  };
  return colors[props.color];
});

// Get step state
const getStepState = (index: number, step: Step) => {
  const stepNumber = index + 1;
  
  if (step.error) return 'error';
  if (step.complete || stepNumber < props.modelValue) return 'complete';
  if (stepNumber === props.modelValue) return 'active';
  return 'inactive';
};

// Step circle classes
const getStepCircleClasses = (index: number, step: Step) => {
  const state = getStepState(index, step);
  const classes = [
    'flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold transition-all duration-200',
  ];
  
  switch (state) {
    case 'active':
      classes.push(colorClasses.value.active, 'ring-4 ring-primary-100 dark:ring-primary-900/30');
      break;
    case 'complete':
      classes.push(colorClasses.value.completed);
      break;
    case 'error':
      classes.push('bg-red-500 text-white');
      break;
    default:
      classes.push('bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400');
  }
  
  return classes;
};

// Step title classes
const getStepTitleClasses = (index: number, step: Step) => {
  const state = getStepState(index, step);
  const classes = ['font-medium transition-colors'];
  
  switch (state) {
    case 'active':
      classes.push('text-slate-900 dark:text-white');
      break;
    case 'complete':
      classes.push('text-slate-700 dark:text-slate-300');
      break;
    case 'error':
      classes.push('text-red-600 dark:text-red-400');
      break;
    default:
      classes.push('text-slate-400 dark:text-slate-500');
  }
  
  return classes;
};

// Line classes
const getLineClasses = (index: number) => {
  const isCompleted = index + 1 < props.modelValue;
  const classes = ['transition-all duration-300'];
  
  if (props.vertical) {
    classes.push('w-0.5 min-h-[24px] ml-4');
  } else {
    classes.push('h-0.5 flex-1 mx-2');
  }
  
  if (isCompleted) {
    classes.push(colorClasses.value.line);
  } else {
    classes.push('bg-slate-200 dark:bg-slate-700');
  }
  
  return classes;
};

// Check if step is clickable
const isStepClickable = (index: number, step: Step) => {
  const stepNumber = index + 1;
  
  // Non-linear mode or editable: always clickable
  if (!props.linear || props.editable) return true;
  
  // Linear mode: can only click completed steps or current step
  // Cannot click future steps
  if (stepNumber > props.modelValue) return false;
  
  return true;
};

// Handle step click
const handleStepClick = (index: number, step: Step) => {
  if (!isStepClickable(index, step)) return;
  
  const stepNumber = index + 1;
  emit('update:modelValue', stepNumber);
};

// Navigation
const canGoBack = computed(() => props.modelValue > 1);
const canGoNext = computed(() => props.modelValue < props.steps.length);

const goBack = () => {
  if (canGoBack.value) {
    emit('update:modelValue', props.modelValue - 1);
  }
};

const goNext = () => {
  if (canGoNext.value) {
    emit('update:modelValue', props.modelValue + 1);
  }
};

defineExpose({
  goBack,
  goNext,
  canGoBack,
  canGoNext,
});
</script>

<template>
  <div class="w-full">
    <!-- Stepper Header -->
    <div 
      :class="[
        'flex',
        vertical ? 'flex-col' : 'items-center',
        altLabels ? 'justify-between' : ''
      ]"
    >
      <template v-for="(step, index) in steps" :key="index">
        <!-- Step Item -->
        <div 
          :class="[
            'flex items-center',
            vertical ? 'mb-2' : '',
            altLabels ? 'flex-col' : 'gap-3',
            isStepClickable(index, step) ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
          ]"
          @click="handleStepClick(index, step)"
        >
          <!-- Step Circle -->
          <div :class="getStepCircleClasses(index, step)">
            <template v-if="step.complete || index + 1 < modelValue">
              <i class="mdi mdi-check text-lg" />
            </template>
            <template v-else-if="step.error">
              <i class="mdi mdi-alert text-lg" />
            </template>
            <template v-else-if="step.icon">
              <i :class="['mdi', step.icon, 'text-lg']" />
            </template>
            <template v-else>
              {{ index + 1 }}
            </template>
          </div>
          
          <!-- Step Labels -->
          <div :class="[altLabels ? 'text-center mt-2' : '']">
            <p :class="getStepTitleClasses(index, step)">
              {{ step.title }}
            </p>
            <p 
              v-if="step.subtitle" 
              class="text-xs text-slate-500 dark:text-slate-400"
            >
              {{ step.subtitle }}
            </p>
          </div>
        </div>
        
        <!-- Connector Line -->
        <div 
          v-if="index < steps.length - 1" 
          :class="getLineClasses(index)"
        />
      </template>
    </div>
    
    <!-- Step Content -->
    <div class="mt-6">
      <template v-for="(step, index) in steps" :key="`content-${index}`">
        <div v-show="index + 1 === modelValue">
          <slot :name="`step-${index + 1}`" :step="step" :index="index" />
        </div>
      </template>
    </div>
    
    <!-- Actions Slot -->
    <slot name="actions" :go-back="goBack" :go-next="goNext" :can-go-back="canGoBack" :can-go-next="canGoNext" />
  </div>
</template>
