import { mount } from '@vue/test-utils';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Login from './src/Login.vue'; // Ajusta la ruta según sea necesario
import { resultadoLogin, userLogin, obtenerTurno } from '@/store/auth.js';
import { createRouter, createWebHistory } from 'vue-router';
import { routes } from '@/router';
import { supabase } from '@/supabase/supabase'; // Añade esta importación

// Mock obtenerTurno ya que lo estás usando en tu componente
vi.mock('@/store/auth.js', async () => {
  const actual = await vi.importActual('@/store/auth.js');
  return {
    ...actual,
    obtenerTurno: vi.fn(),
    resultadoLogin: { value: '' },
    userLogin: { value: null }
  };
});

// Mock localStorage
vi.spyOn(Storage.prototype, 'setItem');

// Mock supabase
vi.mock('@/supabase/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn().mockResolvedValue({
            data: { idusuario: 1, userName: 'abm', password: '242717' },
            error: null,
          }),
        })),
      })),
    })),
  },
}));

// Configurar router
const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: { template: '<div>Login</div>' } },
    { path: '/home', component: { template: '<div>Home</div>' } }
  ],
});

// Mock router.push
vi.spyOn(router, 'push');

describe('Login Component', () => {
  beforeEach(() => {
    // Reiniciar mocks y estado
    vi.clearAllMocks();
    resultadoLogin.value = '';
    userLogin.value = null;
    router.push('/');
    localStorage.clear();
  });

  it('debe iniciar sesión correctamente y redirigir al home', async () => {
    // Montar el componente
    const wrapper = mount(Login, {
      global: {
        plugins: [router],
        stubs: ['router-link', 'router-view'],
      },
    });

    // Establecer valores de entrada
    await wrapper.find('input[placeholder="Usuario"]').setValue('abm');
    await wrapper.find('input[placeholder="Contraseña"]').setValue('242717');

    // Hacer clic en el botón de inicio de sesión
    await wrapper.find('button.bg-yellow-300').trigger('click');

    // Esperar a que se completen las operaciones asíncronas
    await vi.waitFor(() => {
      expect(resultadoLogin.value).toBe('Inicio sesion correcto');
    });

    // Verificar que userLogin se haya actualizado correctamente
    expect(userLogin.value).toBe(1);

    // Verificar que se haya guardado en localStorage
    expect(localStorage.setItem).toHaveBeenCalledWith('userLogin', 1);

    // Verificar que se haya llamado a obtenerTurno
    expect(obtenerTurno).toHaveBeenCalled();

    // Verificar que se haya realizado la redirección
    expect(router.push).toHaveBeenCalledWith('/home');
  });

  it('debe mostrar un mensaje de error con credenciales incorrectas', async () => {
    // Modificar el mock para este caso específico
    // En lugar de usar vi.mocked(supabase.from), reconfiguramos el mock completo
    vi.mocked(supabase.from).mockReturnValueOnce({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { idusuario: 1, userName: 'abm', password: 'contraseña_incorrecta' },
            error: null,
          }),
        }),
      }),
    });

    const wrapper = mount(Login, {
      global: {
        plugins: [router],
        stubs: ['router-link', 'router-view'],
      },
    });

    await wrapper.find('input[placeholder="Usuario"]').setValue('abm');
    await wrapper.find('input[placeholder="Contraseña"]').setValue('242717');
    await wrapper.find('button.bg-yellow-300').trigger('click');

    // Esperar a que se muestre el mensaje de error
    await vi.waitFor(() => {
      expect(wrapper.find('.alert-error').exists()).toBe(true);
    });

    // Verificar el mensaje de error
    expect(wrapper.find('.alert-error').text()).toContain('Usuario o contraseña incorrectos');
    
    // Verificar que resultadoLogin se haya actualizado
    expect(resultadoLogin.value).toBe('Credenciales Incorrectas');
    
    // Verificar que se redirigió a la página de inicio
    expect(router.push).toHaveBeenCalledWith('/');
  });
});