<template>
  <div v-if="loading" class="text-center mt-10">Загрузка...</div>
  <div v-else-if="error" class="text-center text-red-600 mt-10">{{ error }}</div>
  <div v-else class="max-w-lg mx-auto mt-10 p-4 rounded-2xl shadow-xl">
    <h1 class="text-2xl mb-4">Результаты теста</h1>
    <div class="mb-4">Ваш балл: <b>{{ result.score }}</b></div>
    <ul>
      <li
          v-for="(ans, i) in result.answers"
          :key="i"
          :class="['mb-4', ans.optionId === ans.correctOptionId ? 'bg-green-50 border-l-4 border-green-400 pl-4' : 'bg-red-50 border-l-4 border-red-400 pl-4']"
      >
        <b>Вопрос {{ i + 1 }}: {{ questions[i]?.text || 'Вопрос не найден' }}</b>
        <div>
          <span v-if="ans.optionId === ans.correctOptionId" class="text-green-600 font-bold">✔ верно</span>
          <span v-else class="text-red-600 font-bold">✗ неверно</span>
        </div>
        <div :class="ans.optionId === ans.correctOptionId ? 'text-green-700 font-semibold' : 'text-red-600'">
          Ваш ответ:
          <span v-if="ans.optionId !== null && ans.optionId !== undefined">"{{ getOptionText(i, ans.optionId) }}"</span>
          <span v-else>не отвечено</span>
        </div>
        <div :class="ans.optionId === ans.correctOptionId ? 'text-green-700 font-semibold' : 'text-red-600'">
          Правильный ответ: "{{ getOptionText(i, ans.correctOptionId) }}"
        </div>
      </li>
    </ul>
    <router-link :to="`/attempt/${uniqueUrl}`" class="inline-block mt-6 ml-4 text-blue-600 underline">Вернуться к вопросам</router-link>
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
const questions = ref<any[]>([]);

function getOptionText(questionIndex: number, optionId: string | null) {
  if (!optionId) return '';
  const opts = questions.value[questionIndex]?.options || [];
  const opt = opts.find((o: any) => o._id.toString() === optionId);
  return opt ? opt.text : '';
}

onMounted(async () => {
  try {
    const res = await fetch(`/api/students/attempt/${uniqueUrl}/result`);
    if (!res.ok) throw new Error('Результат не найден');
    result.value = await res.json();

    console.log('LOADED RESULT', result.value);

    // Используем встроенные данные вопросов из результата
    questions.value = result.value.questions || [];
    loading.value = false;
  } catch (e: any) {
    error.value = e.message || 'Ошибка';
  }
});
</script>
