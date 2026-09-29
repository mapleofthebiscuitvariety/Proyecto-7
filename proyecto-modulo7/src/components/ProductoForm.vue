<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { useStore } from 'vuex'
import { mensajeError } from '@/api'
import { mostrarAviso } from '@/composables/useAviso'
import { CATEGORIAS_BASE } from '@/utils/catalogo'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  // null = crear un producto nuevo
  producto: { type: Object, default: null }
})

const emit = defineEmits(['update:modelValue', 'guardado'])
const store = useStore()

const formulario = ref(null)
const guardando = ref(false)
const errorEnvio = ref('')

const vacio = () => ({
  titulo: '',
  autor: '',
  categoria: 'Novela',
  descripcion: '',
  precio: 0,
  stock: 0,
  rating: 4,
  imagen: '',
  destacado: false
})
const datos = reactive(vacio())

const abierto = computed({
  get: () => props.modelValue,
  set: valor => emit('update:modelValue', valor)
})

const categorias = computed(() =>
  [...new Set([...CATEGORIAS_BASE, ...store.getters['productos/categorias']])]
)

const requerido = v => (v !== null && v !== undefined && String(v).trim() !== '') || 'Este campo es obligatorio'
const enteroPositivo = v => (Number.isInteger(Number(v)) && Number(v) >= 0) || 'Debe ser un número entero mayor o igual a 0'
const precioValido = v => (Number(v) > 0) || 'El precio debe ser mayor a 0'
const ratingValido = v => (Number(v) >= 0 && Number(v) <= 5) || 'Debe estar entre 0 y 5'
const urlValida = v => !v || /^https?:\/\//i.test(v) || 'Debe comenzar con http:// o https://'

// Cada vez que se abre el diálogo se rellena (edición) o se limpia (nuevo)
watch(
  () => props.modelValue,
  visible => {
    if (!visible) return
    errorEnvio.value = ''
    Object.assign(datos, vacio(), props.producto || {})
  }
)

async function guardar() {
  const { valid } = await formulario.value.validate()
  if (!valid) return

  guardando.value = true
  errorEnvio.value = ''
  const payload = {
    ...datos,
    titulo: datos.titulo.trim(),
    autor: datos.autor.trim(),
    precio: Number(datos.precio),
    stock: Number(datos.stock),
    rating: Number(datos.rating)
  }
  try {
    if (props.producto) await store.dispatch('productos/editar', { ...payload, id: props.producto.id })
    else await store.dispatch('productos/agregar', payload)
    mostrarAviso(props.producto ? 'Producto actualizado' : 'Producto creado')
    emit('guardado')
    abierto.value = false
  } catch (e) {
    errorEnvio.value = mensajeError(e, 'No se pudo guardar el producto.')
  } finally {
    guardando.value = false
  }
}
</script>

<template>
  <v-dialog v-model="abierto" max-width="640" scrollable>
    <v-card class="sticker">
      <v-card-title class="titulo-md pt-4">
        {{ producto ? 'Editar producto' : 'Nuevo producto' }}
      </v-card-title>

      <v-card-text>
        <v-form ref="formulario" @submit.prevent="guardar">
          <v-row dense>
            <v-col cols="12" sm="7">
              <v-text-field v-model="datos.titulo" label="Título" :rules="[requerido]" data-test="campo-titulo" />
            </v-col>
            <v-col cols="12" sm="5">
              <v-text-field v-model="datos.autor" label="Autor" :rules="[requerido]" data-test="campo-autor" />
            </v-col>
            <v-col cols="12" sm="6">
              <v-select v-model="datos.categoria" :items="categorias" label="Categoría" :rules="[requerido]" />
            </v-col>
            <v-col cols="6" sm="3">
              <v-text-field v-model="datos.precio" label="Precio (CLP)" type="number" min="0" :rules="[precioValido]" data-test="campo-precio" />
            </v-col>
            <v-col cols="6" sm="3">
              <v-text-field v-model="datos.stock" label="Stock" type="number" min="0" :rules="[enteroPositivo]" data-test="campo-stock" />
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field v-model="datos.rating" label="Valoración (0 a 5)" type="number" step="0.1" min="0" max="5" :rules="[ratingValido]" />
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field v-model="datos.imagen" label="URL de la portada (opcional)" :rules="[urlValida]" />
            </v-col>
            <v-col cols="12">
              <v-textarea v-model="datos.descripcion" label="Descripción" rows="3" auto-grow />
            </v-col>
            <v-col cols="12">
              <v-switch v-model="datos.destacado" label="Mostrar en destacados del inicio" color="primary" hide-details />
            </v-col>
          </v-row>

          <v-alert v-if="errorEnvio" type="error" variant="tonal" class="mt-4" data-test="error-formulario">
            {{ errorEnvio }}
          </v-alert>
        </v-form>
      </v-card-text>

      <v-card-actions class="px-6 pb-4">
        <v-spacer />
        <v-btn variant="text" :disabled="guardando" @click="abierto = false">Cancelar</v-btn>
        <v-btn color="primary" variant="flat" :loading="guardando" data-test="btn-guardar" @click="guardar">
          {{ producto ? 'Guardar cambios' : 'Crear producto' }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
