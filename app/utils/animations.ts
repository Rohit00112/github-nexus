import { gsap } from 'gsap';

// Check if the user prefers reduced motion
const prefersReducedMotion = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

// Animation durations based on user preferences
const getDuration = (duration: number): number => {
  return prefersReducedMotion() ? 0.1 : duration;
};

// Stagger values based on user preferences
const getStagger = (stagger: number): number => {
  return prefersReducedMotion() ? 0.01 : stagger;
};

/**
 * Animate elements into view with a fade and slide up effect
 * @param elements - Elements to animate
 * @param delay - Delay before animation starts
 * @param stagger - Stagger between each element's animation
 */
export const fadeInUp = (
  elements: string | gsap.utils.Selector | Element | Element[] | NodeList,
  delay: number = 0,
  stagger: number = 0.1
): gsap.core.Timeline => {
  return gsap.timeline({
    defaults: { ease: 'power2.out' }
  }).fromTo(
    elements,
    { 
      y: 20, 
      opacity: 0 
    },
    { 
      y: 0, 
      opacity: 1, 
      duration: getDuration(0.6), 
      stagger: getStagger(stagger),
      delay
    }
  );
};

/**
 * Animate elements into view with a fade and slide in from left effect
 * @param elements - Elements to animate
 * @param delay - Delay before animation starts
 * @param stagger - Stagger between each element's animation
 */
export const fadeInLeft = (
  elements: string | gsap.utils.Selector | Element | Element[] | NodeList,
  delay: number = 0,
  stagger: number = 0.1
): gsap.core.Timeline => {
  return gsap.timeline({
    defaults: { ease: 'power2.out' }
  }).fromTo(
    elements,
    { 
      x: -20, 
      opacity: 0 
    },
    { 
      x: 0, 
      opacity: 1, 
      duration: getDuration(0.6), 
      stagger: getStagger(stagger),
      delay
    }
  );
};

/**
 * Animate elements into view with a fade and slide in from right effect
 * @param elements - Elements to animate
 * @param delay - Delay before animation starts
 * @param stagger - Stagger between each element's animation
 */
export const fadeInRight = (
  elements: string | gsap.utils.Selector | Element | Element[] | NodeList,
  delay: number = 0,
  stagger: number = 0.1
): gsap.core.Timeline => {
  return gsap.timeline({
    defaults: { ease: 'power2.out' }
  }).fromTo(
    elements,
    { 
      x: 20, 
      opacity: 0 
    },
    { 
      x: 0, 
      opacity: 1, 
      duration: getDuration(0.6), 
      stagger: getStagger(stagger),
      delay
    }
  );
};

/**
 * Scale elements up with a bounce effect
 * @param elements - Elements to animate
 * @param delay - Delay before animation starts
 * @param stagger - Stagger between each element's animation
 */
export const scaleUp = (
  elements: string | gsap.utils.Selector | Element | Element[] | NodeList,
  delay: number = 0,
  stagger: number = 0.1
): gsap.core.Timeline => {
  return gsap.timeline({
    defaults: { ease: 'back.out(1.7)' }
  }).fromTo(
    elements,
    { 
      scale: 0.8, 
      opacity: 0 
    },
    { 
      scale: 1, 
      opacity: 1, 
      duration: getDuration(0.7), 
      stagger: getStagger(stagger),
      delay
    }
  );
};

/**
 * Animate number counting up effect
 * @param element - Element to animate
 * @param endValue - Final number value
 * @param prefix - Text to display before the number
 * @param suffix - Text to display after the number
 * @param duration - Animation duration
 */
export const countUp = (
  element: string | Element,
  endValue: number,
  prefix: string = '',
  suffix: string = '',
  duration: number = 2
): gsap.core.Tween => {
  const el = typeof element === 'string' ? document.querySelector(element) : element;
  if (!el) return gsap.to({}, { duration: 0 });

  const obj = { value: 0 };
  
  return gsap.to(obj, {
    value: endValue,
    duration: getDuration(duration),
    ease: 'power2.out',
    onUpdate: function() {
      if (el) {
        const formattedValue = Math.round(obj.value).toLocaleString();
        (el as HTMLElement).innerHTML = `${prefix}${formattedValue}${suffix}`;
      }
    }
  });
};

/**
 * Create a staggered animation for timeline items
 * @param container - Container element
 * @param itemSelector - Selector for timeline items
 * @param delay - Delay before animation starts
 */
export const animateTimeline = (
  container: string | Element,
  itemSelector: string,
  delay: number = 0
): gsap.core.Timeline => {
  const timeline = gsap.timeline({ defaults: { ease: 'power2.out' } });
  
  if (typeof container === 'string') {
    container = document.querySelector(container) as Element;
  }
  
  if (!container) return timeline;
  
  const items = (container as Element).querySelectorAll(itemSelector);
  
  timeline.fromTo(
    items,
    { 
      x: -20, 
      opacity: 0 
    },
    { 
      x: 0, 
      opacity: 1, 
      duration: getDuration(0.5), 
      stagger: getStagger(0.15),
      delay
    }
  );
  
  return timeline;
};

/**
 * Add hover animation to elements
 * @param elements - Elements to add hover animation to
 * @param scale - Scale factor on hover
 */
export const addHoverAnimation = (
  elements: string | Element | Element[] | NodeList,
  scale: number = 1.05
): void => {
  if (prefersReducedMotion()) return;
  
  const els = typeof elements === 'string' 
    ? document.querySelectorAll(elements)
    : elements instanceof Element 
      ? [elements] 
      : elements;
  
  if (!els) return;
  
  Array.from(els).forEach(el => {
    el.addEventListener('mouseenter', () => {
      gsap.to(el, { scale, duration: 0.3, ease: 'power1.out' });
    });
    
    el.addEventListener('mouseleave', () => {
      gsap.to(el, { scale: 1, duration: 0.3, ease: 'power1.out' });
    });
  });
};

/**
 * Animate chart data
 * @param chartInstance - Chart.js instance
 * @param duration - Animation duration
 */
export const animateChartData = (
  chartInstance: any,
  duration: number = 1.5
): void => {
  if (!chartInstance || !chartInstance.data || !chartInstance.data.datasets) return;
  
  const datasets = chartInstance.data.datasets;
  
  datasets.forEach((dataset: any, index: number) => {
    const originalData = [...dataset.data];
    dataset.data = Array(originalData.length).fill(0);
    
    chartInstance.update('none');
    
    gsap.to(dataset.data, {
      duration: getDuration(duration),
      ease: 'power2.out',
      delay: index * 0.2,
      onUpdate: function() {
        chartInstance.update('none');
      },
      onComplete: function() {
        dataset.data = originalData;
        chartInstance.update();
      }
    });
  });
};
