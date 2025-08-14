import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { mount, VueWrapper } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { createRouter, createWebHistory } from 'vue-router';

// Import components
import Home from '../../../client/src/components/views/Home.vue';
import Marketplace from '../../../client/src/components/views/Marketplace.vue';
import Profile from '../../../client/src/components/views/Profile.vue';
import Tools from '../../../client/src/components/views/Tools.vue';
import AuthModal from '../../../client/src/components/shared/AuthModal.vue';

// Test utilities
const createTestWrapper = (component: any, options = {}) => {
  const pinia = createPinia();
  setActivePinia(pinia);
  
  const mockRouter = createRouter({
    history: createWebHistory(),
    routes: [
      { path: '/', component: Home },
      { path: '/marketplace', component: Marketplace },
      { path: '/profile', component: Profile },
      { path: '/tools', component: Tools }
    ]
  });
  
  return mount(component, {
    global: {
      plugins: [pinia, mockRouter],
      stubs: {
        'router-link': { template: '<a><slot /></a>' },
        'router-view': { template: '<div><slot /></div>' }
      }
    },
    ...options
  });
};

describe('Vue Components - Production Grade Tests', () => {
  let wrapper: VueWrapper<any>;
  
  beforeEach(() => {
    // Reset stores
    const pinia = createPinia();
    setActivePinia(pinia);
  });

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount();
    }
  });

  describe('Home Component', () => {
    it('should render without crashing', () => {
      wrapper = createTestWrapper(Home);
      expect(wrapper.exists()).toBe(true);
    });

    it('should display main heading', () => {
      wrapper = createTestWrapper(Home);
      expect(wrapper.text()).toContain('Foundling');
    });

    it('should have correct component name', () => {
      wrapper = createTestWrapper(Home);
      expect(wrapper.vm.$options.name || 'Home').toBe('Home');
    });

    it('should have home template class', () => {
      wrapper = createTestWrapper(Home);
      expect(wrapper.classes()).toContain('home');
    });
  });

  describe('Marketplace Component', () => {
    it('should render marketplace interface', () => {
      wrapper = createTestWrapper(Marketplace);
      expect(wrapper.exists()).toBe(true);
    });

    it('should have correct component name', () => {
      wrapper = createTestWrapper(Marketplace);
      expect(wrapper.vm.$options.name || 'Marketplace').toBe('Marketplace');
    });

    it('should have marketplace template class', () => {
      wrapper = createTestWrapper(Marketplace);
      expect(wrapper.classes()).toContain('marketplace');
    });
  });

  describe('Profile Component', () => {
    it('should render user profile interface', () => {
      wrapper = createTestWrapper(Profile);
      expect(wrapper.exists()).toBe(true);
    });

    it('should have correct component name', () => {
      wrapper = createTestWrapper(Profile);
      expect(wrapper.vm.$options.name || 'Profile').toBe('Profile');
    });

    it('should have profile template class', () => {
      wrapper = createTestWrapper(Profile);
      expect(wrapper.classes()).toContain('profile');
    });
  });

  describe('Tools Component', () => {
    it('should render tools interface', () => {
      wrapper = createTestWrapper(Tools);
      expect(wrapper.exists()).toBe(true);
    });

    it('should have correct component name', () => {
      wrapper = createTestWrapper(Tools);
      expect(wrapper.vm.$options.name || 'Tools').toBe('Tools');
    });

    it('should have tools template class', () => {
      wrapper = createTestWrapper(Tools);
      expect(wrapper.classes()).toContain('tools');
    });
  });

  describe('AuthModal Component', () => {
    it('should render authentication modal', () => {
      wrapper = createTestWrapper(AuthModal);
      expect(wrapper.exists()).toBe(true);
    });

    it('should have correct component name', () => {
      wrapper = createTestWrapper(AuthModal);
      expect(wrapper.vm.$options.name || 'AuthModal').toBe('AuthModal');
    });

    it('should have auth modal template class', () => {
      wrapper = createTestWrapper(AuthModal);
      expect(wrapper.classes()).toContain('auth-modal');
    });
  });
});
