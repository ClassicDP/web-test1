<template>
  <div v-if="loading" class="text-center mt-10">Загрузка...</div>
  <div v-else-if="error" class="text-center text-red-600 mt-10">{{ error }}</div>
  <div v-else class="max-w-lg mx-auto mt-10 p-6 rounded-2xl shadow-lg bg-white">
    <h1 class="text-3xl font-bold mb-6 text-center">{{ test?.title }}</h1>
    <form @submit.prevent="submit">
      <div v-for="q in test?.questions || []" :key="q._id" class="mb-6">
        <div class="font-semibold text-lg mb-3">{{ q.text }}</div>
        <div v-for="opt in q.options" :key="opt._id" class="mb-2">
          <label class="inline-flex items-center space-x-2 cursor-pointer">
            <input
                type="radio"
                :name="q._id"
                :value="opt._id"
                v-model="answers[q._id]"
                class="form-radio text-blue-600"
            />
            <span class="text-gray-800">{{ opt.text }}</span>
          </label>
        </div>
      </div>
      <button
          type="submit"
          class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-md shadow"
          :disabled="submitting"
      >
        {{ submitting ? 'Отправка…' : 'Отправить' }}
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const debug = true;

const route  = useRoute();
const router = useRouter();
const uniqueUrl = route.params.uniqueUrl as string;

/* реактивные переменные */
const test       = ref<any>(null);
const answers    = ref<Record<string, string>>({});
const loading    = ref(true);
const submitting = ref(false);
const error      = ref('');

/* базовый URL API (из Vite-переменной или '/api') */
const baseUrl =
    (import.meta as any).env?.VITE_API_URL?.replace(/\/$/, '') || '/api';

/* все ли ответы даны */
const allAnswered = computed(
    () => !!test.value && Object.values(answers.value).every((v) => v)
);

/* ───── Загрузка теста ───── */
onMounted(async () => {
  try {
    const res = await fetch(`${baseUrl}/students/attempt/${uniqueUrl}`);
    if (!res.ok) throw new Error('Тест не найден');
    const data = await res.json();
    test.value = data.test || {};
    console.log('TEST LOADED', test.value);

    /* инициализируем ответы пустыми строками */
    answers.value = Object.fromEntries(
        (test.value.questions || []).map((q: any) => [q._id, ''])
    );
    console.log('INIT EMPTY ANSWERS', answers.value);

    // Попытка загрузить старые ответы
    try {
      const resOld = await fetch(`${baseUrl}/students/attempt/${uniqueUrl}/result`);
      if (resOld.ok) {
        const resultData = await resOld.json();
        console.log('LOADED OLD ANSWERS', resultData.answers);
        if (resultData.answers && Array.isArray(resultData.answers)) {
          for (const ans of resultData.answers) {
            if (ans.questionId && (ans.optionId !== undefined) && (ans.questionId in answers.value)) {
              answers.value[ans.questionId] = ans.optionId === null ? '' : ans.optionId;
            }
          }
          console.log('APPLIED OLD ANSWERS', answers.value);
        }
      }
    } catch {
      // Игнорируем ошибки при загрузке старых ответов
    }
  } catch (e: any) {
    error.value = e.message || 'Ошибка загрузки теста';
  } finally {
    loading.value = false;
  }
});

/* ───── Отправка ответов ───── */
async function submit() {
  submitting.value = true;
  error.value = '';
  try {
    const payload = {
      answers: Object.entries(answers.value).map(([questionId, optionId]) => ({
        questionId,
        optionId,
      })),
    };
    console.log('SUBMIT PAYLOAD', payload);

    const res = await fetch(
        `${baseUrl}/students/attempt/${uniqueUrl}/result`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
    );
    if (!res.ok) throw new Error('Ошибка отправки результатов');
    console.log('SUBMIT SUCCESS');
    await router.push(`/result/${uniqueUrl}`);
  } catch (e: any) {
    console.error('SUBMIT ERROR', e);
    error.value = e.message || 'Ошибка';
  } finally {
    submitting.value = false;
  }
}
</script>

<style scoped>
/* Подключи Tailwind или можно кастомный стиль, если нет Tailwind */
body {
  background-color: #f0f4f8;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}
.text-center {
  text-align: center;
}
.mt-10 {
  margin-top: 2.5rem;
}
.max-w-lg {
  max-width: 32rem;
}
.mx-auto {
  margin-left: auto;
  margin-right: auto;
}
.p-6 {
  padding: 1.5rem;
}
.rounded-2xl {
  border-radius: 1rem;
}
.shadow-lg {
  box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
}
.bg-white {
  background-color: white;
}
.text-3xl {
  font-size: 1.875rem;
  line-height: 2.25rem;
}
.font-bold {
  font-weight: 700;
}
.mb-6 {
  margin-bottom: 1.5rem;
}
.font-semibold {
  font-weight: 600;
}
.text-lg {
  font-size: 1.125rem;
  line-height: 1.75rem;
}
.mb-3 {
  margin-bottom: 0.75rem;
}
.inline-flex {
  display: inline-flex;
}
.items-center {
  align-items: center;
}
.space-x-2 > :not(template) ~ :not(template) {
  margin-left: 0.5rem;
}
.cursor-pointer {
  cursor: pointer;
}
.form-radio {
  appearance: none;
  border: 2px solid #d1d5db;
  border-radius: 50%;
  width: 1.25rem;
  height: 1.25rem;
  position: relative;
}
.form-radio:checked {
  border-color: #2563eb;
  background-color: #2563eb;
}
.text-blue-600 {
  color: #2563eb;
}
.text-gray-800 {
  color: #1f2937;
}
.w-full {
  width: 100%;
}
.bg-blue-600 {
  background-color: #2563eb;
}
.hover\:bg-blue-700:hover {
  background-color: #1d4ed8;
}
.text-white {
  color: white;
}
.py-3 {
  padding-top: 0.75rem;
  padding-bottom: 0.75rem;
}
.rounded-md {
  border-radius: 0.375rem;
}
.shadow {
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}
</style>