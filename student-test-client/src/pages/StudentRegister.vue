<template>
  <div class="max-w-lg mx-auto mt-10 p-4 rounded-2xl shadow-xl">
    <h1 class="text-2xl mb-4">Регистрация студента на тест</h1>
    <form @submit.prevent="register">
      <label class="block mb-2">Имя</label>
      <input v-model="name" class="mb-4 border rounded p-2 w-full" required />
      <label class="block mb-2">Email</label>
      <input v-model="email" type="email" class="mb-4 border rounded p-2 w-full" required />
      <label class="block mb-2">ID теста (выдает преподаватель)</label>
      <input v-model="testId" class="mb-4 border rounded p-2 w-full" required />
      <button type="submit" class="bg-blue-600 text-white rounded px-4 py-2">Получить ссылку на тест</button>
    </form>
    <div v-if="testUrl" class="mt-6">
      <p>Ваша уникальная ссылка:</p>
      <a :href="testUrl" class="text-blue-700 underline">{{ testUrl }}</a>
    </div>
    <div v-if="error" class="mt-4 text-red-600">{{ error }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const name = ref('');
const email = ref('');
const testId = ref('');
const testUrl = ref('');
const error = ref('');

async function register() {
  error.value = '';
  testUrl.value = '';
  try {
    // 1. Создаем студента
    const res1 = await fetch(`${process.env.VUE_APP_API_URL}/students`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name.value, email: email.value, registrations: [] }),
    });
    if (!res1.ok) throw new Error('Ошибка создания студента');
    const student = await res1.json();

    // 2. Регистрируем на тест
    const res2 = await fetch(`${process.env.VUE_APP_API_URL}/students/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentId: student._id, testId: testId.value }),
    });
    if (!res2.ok) throw new Error('Ошибка регистрации на тест');
    const data = await res2.json();
    testUrl.value = `/attempt/${data.registration.uniqueUrl}`;
  } catch (e: any) {
    error.value = e.message || 'Ошибка';
  }
}
</script>
