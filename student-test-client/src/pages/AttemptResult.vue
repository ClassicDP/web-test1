<template>
  <div v-if="loading" class="text-center mt-10">Загрузка...</div>
  <div v-else-if="error" class="text-center text-red-600 mt-10">{{ error }}</div>
  <div v-else class="max-w-lg mx-auto mt-10 p-4 rounded-2xl shadow-xl">
    <h1 class="text-2xl mb-4">Результаты теста</h1>
    <div class="mb-4">Ваш балл: <b>{{ result.score }}</b></div>
    <ul>
      <li v-for="(ans, i) in result.answers" :key="i" class="mb-2">
        <b>Вопрос {{ i+1 }}:</b>
        <span v-if="ans.isCorrect" class="text-green-600">✔ верно</span>
        <span v-else class="text-red-600">✗ неверно</span>
      </li>
    </ul>
    <router-link to="/" class="inline-block mt-6 text-blue-600 underline">На главную</router-link>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const uniqueUrl = route.params.uniqueUrl as string;
const result = ref<any>(null);
const loading = ref(true);
const error = ref('');

onMounted(async () => {
  try {
    // Можно доработать backend: GET результат по uniqueUrl. Пока повторяем отправку ответов (можно кэшировать или реализовать GET /students/attempt/:uniqueUrl/result)
    const res = await fetch(`${process.env.VUE_APP_API_URL}/students/attempt/${uniqueUrl}/result`);
    if (!res.ok) throw new Error('Результат не найден');
    result.value = await res.json();
    loading.value = false;
  } catch (e: any) {
    error.value = e.message || 'Ошибка';
    loading.value = false;
  }
});
</script>
