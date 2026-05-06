// composables/useComedor.js
import { ref } from "vue";
import { supabase } from "@/supabase/supabase";
import { idPedido } from "@/store/auth.js";

export function useComedor() {
  const checkimpreso  = ref(false);
  const cuenta        = ref(null);
  const folio         = ref(null);
  const orden         = ref(null);
  const horaApertura  = ref(null);
  const horaImpresa   = ref(null);
  const subtotal      = ref(null);
  const descuent      = ref(null);
  const impuestos     = ref(null);
  const totalsindesc  = ref(null);
  const total         = ref(null);

  const pedidosAbiertos   = ref([]);
  const productosPedido   = ref([]);
  const productosExterno  = ref([]);
  const pedidoExterno     = ref([]);

  // ── Cargar lista de pedidos ──────────────────────────────────
  const cargarPedidosAbiertos = async () => {
    const { data, error } = await supabase
      .from("pedidos")
      .select()
      .eq("abierto", true)
      .eq("tipo", "Normal");

    if (error) { console.error("Error al obtener pedidos"); return; }
    pedidosAbiertos.value = data;
  };

  // ── Seleccionar pedido de la lista ───────────────────────────
  const obtenerPedido = (pedido) => {
    cuenta.value       = pedido.nombre;
    folio.value        = pedido.idpedido;
    orden.value        = pedido.numeropedido;
    horaApertura.value = pedido.horaapertura;
    horaImpresa.value  = pedido.horaimpresion || "---";
    checkimpreso.value = pedido.impreso;
    subtotal.value     = `$${pedido.subtotal}`;
    idPedido.value     = pedido.idpedido;
    cargarProductosPedido();
  };

  // ── Recargar el pedido activo desde BD ──────────────────────
  const jalarPedidoEspecifico = async () => {
    const { data, error } = await supabase
      .from("pedidos")
      .select()
      .eq("idpedido", idPedido.value);

    if (error) { console.error("Error al obtener pedido", error); return; }
    obtenerPedido(data[0]);
  };

  // ── Cargar productos del pedido activo ──────────────────────
  const cargarProductosPedido = async () => {
    const { data: productos, error: errorProductos } = await supabase
      .from("productos_pedidos")
      .select(`
        idprodpedi,
        idproducto,
        cantidad,
        productos (
          nombre,
          precio,
          preciosinimporte
        )
      `)
      .eq("idpedido", idPedido.value);

    if (errorProductos) { console.error("Error al obtener productos", errorProductos); return; }

    const idsProds = productos.map((p) => p.idprodpedi);

    const { data: mods, error: errorMods } = await supabase
      .from("productos_pedidos_modificadores")
      .select(`
        idprodpedi,
        modificadores (
          idmodificador,
          nombre,
          precio
        )
      `)
      .in("idprodpedi", idsProds);

    if (errorMods) { console.error("Error al obtener modificadores", errorMods); return; }

    const modificadoresPorProducto = {};
    mods.forEach((m) => {
      if (!m.modificadores) return;
      if (!modificadoresPorProducto[m.idprodpedi]) modificadoresPorProducto[m.idprodpedi] = [];
      modificadoresPorProducto[m.idprodpedi].push({
        idmodificador: m.modificadores.idmodificador,
        nombre:        m.modificadores.nombre,
        precio:        m.modificadores.precio,
      });
    });

    const productosConModificadores = productos.map((p) => ({
      id:           p.idproducto,
      cantidad:     p.cantidad ?? 1,
      descripcion:  p.productos?.nombre || "Sin nombre",
      precio:       p.productos?.precio ?? 0,
      modificadores: modificadoresPorProducto[p.idprodpedi] || [],
    }));

    productosPedido.value  = productosConModificadores;
    productosExterno.value = productosConModificadores;

    await cargarpedido();
    calcularTotales(productosConModificadores, pedidoExterno.value.descuento);
  };

  // ── Cargar fila del pedido activo ───────────────────────────
  const cargarpedido = async () => {
    const { data, error } = await supabase
      .from("pedidos")
      .select()
      .eq("idpedido", idPedido.value);

    if (error) { console.error("Error obtener pedido", error); return; }
    pedidoExterno.value = data[0];
  };

  // ── Actualizar total en BD ──────────────────────────────────
  const actualizarTotalEnBD = async (montoFinal) => {
    const { error } = await supabase
      .from("pedidos")
      .update({ totalPedido: montoFinal })
      .eq("idpedido", idPedido.value);

    if (error) console.error("Error al actualizar total en la base de datos", error);
  };

  // ── Calcular totales ────────────────────────────────────────
  const calcularTotales = (productos = [], descuentoPorcentaje = 0) => {
    const totalBruto = productos.reduce((acc, item) => {
      const modTotal = item.modificadores?.reduce((s, mod) => s + Number(mod.precio || 0), 0) || 0;
      return acc + (Number(item.precio || 0) + modTotal) * Number(item.cantidad || 1);
    }, 0);

    const subtotalSinIVA       = totalBruto / 1.16;
    const impuestosCalculados  = totalBruto - subtotalSinIVA;
    const descuentoCalculado   = totalBruto * (descuentoPorcentaje / 100);
    const totalFinal           = totalBruto - descuentoCalculado;

    subtotal.value     = `$${subtotalSinIVA.toFixed(2)}`;
    descuent.value     = `${descuentoPorcentaje}%`;
    impuestos.value    = `$${impuestosCalculados.toFixed(2)}`;
    totalsindesc.value = `$${totalBruto.toFixed(2)}`;
    total.value        = `$${totalFinal.toFixed(2)}`;

    actualizarTotalEnBD(totalFinal.toFixed(2));
  };

  // ── Actualizar total antes de pagar ────────────────────────
  const actualizarTotalPedido = async () => {
    const productos           = productosPedido.value;
    const descuentoPorcentaje = parseFloat(pedidoExterno.value?.descuento || 0);

    const totalBruto = productos.reduce((acc, item) => {
      const modTotal = item.modificadores?.reduce((s, mod) => s + Number(mod.precio || 0), 0) || 0;
      return acc + (Number(item.precio || 0) + modTotal) * Number(item.cantidad || 1);
    }, 0);

    const descuentoCalculado = totalBruto * (descuentoPorcentaje / 100);
    const totalFinal         = totalBruto - descuentoCalculado;

    const { error } = await supabase
      .from("pedidos")
      .update({ totalPedido: totalFinal.toFixed(2) })
      .eq("idpedido", idPedido.value);

    if (error) console.error("❌ Error al actualizar total antes de pagar:", error);
  };

  // ── Marcar como impreso ─────────────────────────────────────
  const imprimirPedido = async () => {
    const { error } = await supabase
      .from("pedidos")
      .update({ impreso: true })
      .eq("idpedido", idPedido.value);

    if (error) { console.error("Error al actualizar pedido impreso", error); return; }
    cargarPedidosAbiertos();
    jalarPedidoEspecifico();
  };

  // ── Limpiar campos del panel ────────────────────────────────
  const limpiarCampos = () => {
    cuenta.value        = null;
    folio.value         = null;
    orden.value         = null;
    horaApertura.value  = null;
    horaImpresa.value   = null;
    checkimpreso.value  = false;
    productosPedido.value = [];
    subtotal.value      = "0.00";
    descuent.value      = "0%";
    totalsindesc.value  = "0.00";
    total.value         = "0.00";
  };

  // ── Callback post-edición ───────────────────────────────────
  const actualizarDespuesDeEditar = () => {
    cargarPedidosAbiertos();
    jalarPedidoEspecifico();
  };

  return {
    // state
    checkimpreso, cuenta, folio, orden, horaApertura, horaImpresa,
    subtotal, descuent, impuestos, totalsindesc, total,
    pedidosAbiertos, productosPedido,
    // actions
    cargarPedidosAbiertos, obtenerPedido, jalarPedidoEspecifico,
    cargarProductosPedido, calcularTotales, actualizarTotalPedido,
    imprimirPedido, limpiarCampos, actualizarDespuesDeEditar,
  };
}