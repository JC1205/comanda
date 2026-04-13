<template>
  <div v-if="mostrar" class="modal-overlay">
    <div class="modal-card">

      <div class="modal-header">
        <div class="modal-header-left">
          <div class="modal-icon"><Users :size="18" /></div>
          <span>Usuarios</span>
        </div>
        <button class="close-btn" @click="$emit('cerrar')"><X :size="16" /></button>
      </div>

      <div class="modal-body">

        <!-- Tabla -->
        <div class="tabla-panel">
          <p class="panel-label">Usuarios registrados</p>
          <div class="tabla-wrapper">
            <table class="tabla">
              <thead>
                <tr>
                  <th>Clave</th>
                  <th>Usuario</th>
                  <th>Tipo</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="usuario in usuarios"
                  :key="usuario.idusuario"
                  @dblclick="seleccionarUsuario(usuario)"
                  :class="{ selected: clave === usuario.idusuario }"
                >
                  <td>{{ usuario.idusuario }}</td>
                  <td>{{ usuario.userName }}</td>
                  <td>{{ usuario.rol }}</td>
                </tr>
                <tr v-if="!usuarios.length">
                  <td colspan="3" class="tabla-empty">Sin usuarios</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Formulario -->
        <div class="form-panel">
          <p class="panel-label">Datos del usuario</p>

          <div class="fields">
            <div class="field-group">
              <label class="field-label">Clave</label>
              <input v-model="clave" type="number" class="field-input field-input--readonly" readonly />
            </div>
            <div class="field-group">
              <label class="field-label">Nombre</label>
              <input v-model="nombre" type="text" class="field-input" placeholder="Nombre completo" />
            </div>
            <div class="field-group">
              <label class="field-label">Tipo</label>
              <select v-model="tipo" class="field-input field-select">
                <option value="Gerente">Gerente</option>
                <option value="Cajero">Cajero</option>
              </select>
            </div>
            <div class="field-group">
              <label class="field-label">Contraseña</label>
              <input v-model="password" type="password" class="field-input" placeholder="••••••" />
            </div>
            <div class="field-group">
              <label class="field-label">Usuario</label>
              <input v-model="user" type="text" class="field-input" placeholder="Nombre de usuario" />
            </div>
          </div>

          <div class="form-actions">
            <button class="btn-secondary" @click="limpiarCampos">Limpiar</button>
            <button class="btn-danger"    @click="delUsuario">Eliminar</button>
            <button class="btn-primary"   @click="aggUsuario">Guardar</button>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits, ref, onMounted } from "vue";
import { Users, X } from "lucide-vue-next";
import { supabase } from "@/supabase/supabase";

const props = defineProps(["mostrar"]);
const emit  = defineEmits(["cerrar"]);

const clave    = ref(null);
const nombre   = ref(null);
const tipo     = ref(null);
const password = ref(null);
const user     = ref(null);
const usuarios = ref([]);

const cargarUsuarios = async () => {
  const { data, error } = await supabase.from("usuarios").select();
  if (error) { console.error("Error al cargar usuarios:", error.message); return; }
  usuarios.value = data;
};

const seleccionarUsuario = (usuario) => {
  clave.value    = usuario.idusuario;
  nombre.value   = usuario.name;
  tipo.value     = usuario.rol;
  password.value = usuario.password;
  user.value     = usuario.userName;
};

const limpiarCampos = () => {
  clave.value = null; nombre.value = null;
  tipo.value = null; password.value = null; user.value = null;
};

const delUsuario = async () => {
  if (clave.value === null) { console.error("Llena el campo clave"); return; }
  const { data, error } = await supabase.from("usuarios").select();
  if (error) { console.error("Error al obtener usuarios", error); return; }
  const existe = data.find(u => u.idusuario === clave.value);
  if (!existe) { console.error("No existe un usuario con esa clave"); return; }
  const { error: errDel } = await supabase.from("usuarios").delete().eq("idusuario", clave.value);
  if (errDel) { console.error("Error al eliminar el usuario", errDel); return; }
  console.log("Usuario eliminado correctamente");
  await cargarUsuarios();
  limpiarCampos();
};

const aggUsuario = async () => {
  const { data: lista, error } = await supabase.from("usuarios").select();
  if (error) { console.error("Error al obtener usuarios:", error); return; }
  const existe = lista.find(u => u.idusuario === clave.value);
  if (existe) {
    const { error: errorUp } = await supabase.from("usuarios").update({
      name: nombre.value, password: password.value, rol: tipo.value, userName: user.value,
    }).eq("idusuario", clave.value);
    if (errorUp) { console.error("Error al actualizar:", errorUp); return; }
    console.log("Usuario actualizado correctamente");
  } else {
    const { data: dataAgg, error: errorAg } = await supabase.from("usuarios").insert([{
      name: nombre.value, password: password.value, rol: tipo.value, userName: user.value,
    }]).select();
    if (errorAg) { console.error("Error al agregar usuario", errorAg); return; }
    clave.value = dataAgg[0].idusuario;
    console.log("Usuario agregado:", dataAgg[0]);
  }
  await cargarUsuarios();
};

onMounted(() => { cargarUsuarios(); });
</script>

<style scoped>
.modal-overlay {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.35);
  display: flex; align-items: center; justify-content: center;
  z-index: 1000;
}

.modal-card {
  background: #fff; border-radius: 18px;
  box-shadow: 0 8px 40px rgba(0,0,0,0.14);
  width: 680px; max-height: 90vh;
  display: flex; flex-direction: column; overflow: hidden;
}

.modal-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 25px 36px; border-bottom: 1px solid #f0f0f0; flex-shrink: 0;
}

.modal-header-left {
  display: flex; align-items: center; gap: 10px;
  font-size: 15px; font-weight: 700; color: #111;
}

.modal-icon {
  width: 34px; height: 34px; border-radius: 10px;
  background: #ede9fe; color: #7c3aed;
  display: flex; align-items: center; justify-content: center;
}

.close-btn {
  width: 30px; height: 30px; border: none; background: #f5f5f5;
  border-radius: 8px; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  color: #888; transition: background 0.15s;
}
.close-btn:hover { background: #ffe5e5; color: #e53935; }

.modal-body { display: flex; flex: 1; overflow: hidden; padding: 10px 36px 32px 32px;}

/* Tabla */
.tabla-panel {
  width: 300px; flex-shrink: 0;
  border-right: 1px solid #f0f0f0;
  display: flex; flex-direction: column;
  padding: 14px; overflow: hidden;
}

.panel-label {
  font-size: 11px; font-weight: 700;
  text-transform: uppercase; letter-spacing: 0.06em;
  color: #bbb; margin: 0 0 10px; flex-shrink: 0;
}

.tabla-wrapper { flex: 1; overflow-y: auto; }

.tabla { width: 100%; border-collapse: collapse; font-size: 13px; }

.tabla th {
  text-align: left; padding: 8px 6px;
  font-size: 11px; font-weight: 600; color: #aaa;
  text-transform: uppercase; letter-spacing: 0.04em;
  border-bottom: 1px solid #f0f0f0;
  position: sticky; top: 0; background: #fff; z-index: 1;
}

.tabla td {
  padding: 8px 6px; color: #333;
  border-bottom: 1px solid #f8f8f8; cursor: pointer;
}

.tabla tr:hover td { background: #f8f8f8; }
.tabla tr.selected td { background: #f3f0ff; }
.tabla-empty { text-align: center; color: #ccc; padding: 20px 0; font-size: 13px; }

/* Formulario */
.form-panel {
  flex: 1; display: flex; flex-direction: column;
  padding: 14px 18px; overflow-y: auto;
}

.fields { display: flex; flex-direction: column; gap: 10px; flex: 1; }

.field-group { display: flex; flex-direction: column; gap: 4px; }

.field-label {
  font-size: 11px; font-weight: 600;
  text-transform: uppercase; letter-spacing: 0.05em; color: #bbb;
}

.field-input {
  padding: 9px 12px;
  border: 1.5px solid #e5e5e5; border-radius: 9px;
  font-size: 13px; color: #111; outline: none;
  transition: border-color 0.2s;
}
.field-input:focus { border-color: #7c3aed; }
.field-input--readonly { background: #fafafa; color: #999; cursor: default; }
.field-select { cursor: pointer; background: #fff; }

input[type=number]::-webkit-inner-spin-button,
input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }

/* Acciones */
.form-actions {
  display: flex; gap: 8px;
  padding-top: 12px; margin-top: 8px;
  border-top: 1px solid #f0f0f0; flex-shrink: 0;
}

.btn-secondary {
  padding: 9px 16px;
  border: 1.5px solid #e5e5e5; border-radius: 9px;
  background: #fff; font-size: 13px; font-weight: 600;
  color: #555; cursor: pointer; transition: all 0.15s;
}
.btn-secondary:hover { background: #f5f5f5; }

.btn-danger {
  padding: 9px 16px;
  border: 1.5px solid #fecaca; border-radius: 9px;
  background: #fff; font-size: 13px; font-weight: 600;
  color: #e53935; cursor: pointer; transition: all 0.15s;
}
.btn-danger:hover { background: #fff0f0; }

.btn-primary {
  flex: 1; padding: 9px 16px; border: none; border-radius: 9px;
  background: #7c3aed; font-size: 13px; font-weight: 600;
  color: #fff; cursor: pointer; transition: all 0.15s;
}
.btn-primary:hover { background: #6d28d9; }
</style>