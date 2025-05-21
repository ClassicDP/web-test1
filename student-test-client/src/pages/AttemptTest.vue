<template>
  <div v-if="loading" class="text-center mt-10">Загрузка...</div>
  <div v-else-if="error" class="text-center text-red-600 mt-10">{{ error }}</div>
  <div v-else class="max-w-lg mx-auto mt-10 p-4 rounded-2xl shadow-xl">
    <h1 class="text-2xl mb-4">{{ test?.title }}</h1>
    <form @submit.prevent="submit">
      <div v-for="q in test.questions" :key="q._id" class="mb-4">
        <div class="font-semibold mb-2">{{ q.text }}</div>
        <div v-for="opt in q.options" :key="opt._id" class="mb-1">
          <label>
            <input type="radio" :name="q._id" :value="opt._id" v-model="answers[q._id]" />
            {{ opt.text }}
          </label>
        </div>
      </div>
      <button type="submit" class="bg-green-600 text-white px-4 py-2 rounded" :disabled="submitting">Отправить</button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();
const uniqueUrl = route.params.uniqueUrl as string;
const test = ref<any>(null);
const answers = ref<Record<string, string>>({});
const loading = ref(true);
const error = ref('');
const submitting = ref(false);

onMounted(async () => {
  try {
    const res = await fetch(`${process.env.VUE_APP_API_URL}/students/attempt/${uniqueUrl}`);
    if (!res.ok) throw new Error('Тест не найден');
    const data = await res.json();
    test.value = data.test;
    loading.value = false;
  } catch (e: any) {
    error.value = e.message || 'Ошибка';
    loading.value = false;
  }
});

async function submit() {
  submitting.value = true;
  error.value = '';
  try {
    const payload = {
      answers: Object.entries(answers.value).map(([questionId, optionId]) => ({
        questionId, optionId,
      }))
    };
    const res = await fetch(`${process.env.VUE_APP_API_URL}/students/attempt/${uniqueUrl}/result`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Ошибка отправки');
    await router.push(`/result/${uniqueUrl}`);
  } catch (e: any) {
    error.value = e.message || 'Ошибка';
  } finally {
    submitting.value = false;
  }
}
</script>
