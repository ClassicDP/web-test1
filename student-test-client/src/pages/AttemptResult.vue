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
          class="mb-4 border-l-4 pl-4"
          :class="{
          'bg-green-50 border-green-400': ans.optionId === ans.correctOptionId,
          'bg-red-50 border-red-400': ans.optionId !== ans.correctOptionId
        }"
      >
        <b>Вопрос {{ i + 1 }}: {{ questions[i]?.text || 'Вопрос не найден' }}</b>
        <div>
          <span v-if="ans.optionId === ans.correctOptionId">
            <span class="font-bold">
              <svg xmlns="http://www.w3.org/2000/svg" class="inline h-6 w-6 text-green-600" viewBox="0 0 20 20" fill="currentColor" style="vertical-align: -0.18em;">
                <path fill-rule="evenodd" d="M16.704 5.293a1 1 0 00-1.414 0L8.5 12.086l-3.293-3.293a1 1 0 00-1.414 1.414l4 4a1 1 0 001.414 0l7-7a1 1 0 000-1.414z" clip-rule="evenodd" />
              </svg>
              верно
            </span>
          </span>
          <span v-else>
            <span class="font-bold">
              <span class="text-red-600" style="font-weight: normal !important; font-family: sans-serif !important;">✗</span>
              неверно
            </span>
          </span>
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
  if (!optionId) return 'Неизвестный вариант';
  const opts = questions.value[questionIndex]?.options || [];
  const opt = opts.find((o: any) => o._id.toString() === optionId?.toString());
  return opt ? opt.text : 'Вариант не найден';
}

onMounted(async () => {
  try {
    const res = await fetch(`/api/students/attempt/${uniqueUrl}/result`);
    if (!res.ok) throw new Error('Результат не найден');
    result.value = await res.json();

    console.log('LOADED RESULT', result.value);
    console.log('ANSWERS:', result.value.answers); // Для отладки

    questions.value = result.value.questions || [];
    loading.value = false;
  } catch (e: any) {
    error.value = e.message || 'Ошибка';
  }
});
</script>
