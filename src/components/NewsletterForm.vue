<script setup>
import { ref } from 'vue'

const props = defineProps({
  content: { type: Object, required: true },
  idPrefix: { type: String, required: true },
})

const submitted = ref(false)

function fieldId(field) {
  return `${props.idPrefix}-${field.id}`
}

function submit(event) {
  if (!event.currentTarget.reportValidity()) return
  submitted.value = true
}
</script>

<template>
  <div class="newsletter-form">
    <form v-if="!submitted" @submit.prevent="submit">
      <template v-for="field in content.fields" :key="field.id">
        <label :for="fieldId(field)" class="form-label">
          {{ field.label }}<span v-if="field.required" class="form-required"> {{ content.required_marker }}</span>
        </label>
        <input
          :id="fieldId(field)"
          :name="field.name"
          :type="field.type"
          :placeholder="field.placeholder"
          :required="field.required"
          class="form-control"
        />
      </template>
      <input type="submit" :data-wait="content.wait_label" class="form-submit" :value="content.submit_label" />
    </form>
    <div v-else class="form-status form-status--success" role="status">
      {{ content.success_message }}
    </div>
  </div>
</template>
