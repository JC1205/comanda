// Importamos las herramientas necesarias para hacer pruebas en nuestro código.
import { mount } from '@vue/test-utils'  // Esto nos permite "montar" el componente para probarlo.
import { describe, it, expect } from 'vitest'  // Estas son funciones que nos ayudan a escribir y ejecutar pruebas.
import Login from './src/Login.vue'  // Importamos el componente de inicio de sesión que queremos probar.


// Agrupamos las pruebas para nuestro componente de inicio de sesión.
describe('LoginComponent', () => {
  
  // Esta es una prueba específica que verifica si los campos de usuario y contraseña funcionan correctamente.
  it('updates the usuario and password fields when typed in', async () => {

    // "Montamos" el componente, es decir, lo ponemos en un lugar donde podamos probarlo.
    const wrapper = mount(Login)

    // Buscamos el cuadro de texto donde el usuario escribe su nombre.
    const usuarioInput = wrapper.find('input[placeholder="Usuario"]')

    // Buscamos el cuadro de texto donde el usuario escribe su contraseña.
    const passwordInput = wrapper.find('input[placeholder="Contraseña"]')

    // Simulamos que alguien escribe "testUser" en el campo de usuario.
    await usuarioInput.setValue('testUser')

    // Simulamos que alguien escribe "secretPassword" en el campo de contraseña.
    await passwordInput.setValue('secretPassword')

    // Comprobamos que el campo de usuario ahora tiene el valor "testUser".
    expect(usuarioInput.element.value).toBe('testUser')

    // Comprobamos que el campo de contraseña ahora tiene el valor "secretPassword".
    expect(passwordInput.element.value).toBe('secretPassword')

  })
})
