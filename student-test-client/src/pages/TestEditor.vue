<template>
  <div class="p-6 max-w-3xl mx-auto">
    <h2 class="text-2xl font-bold mb-4">{{ isEditing ? 'Редактирование теста' : 'Создание теста' }}</h2>
    <input v-model="test.title" placeholder="Название теста" class="w-full border p-2 mb-4" />
    <textarea v-model="test.description" placeholder="Описание" class="w-full border p-2 mb-4"></textarea>

    <div v-for="(q, qIndex) in test.questions" :key="q._id || qIndex" class="border p-4 mb-4 rounded">
      <input v-model="q.text" placeholder="Текст вопроса" class="w-full border p-2 mb-2" />

      <div v-for="(o, oIndex) in q.options" :key="o._id || oIndex" class="flex items-center gap-2 mb-1">
        <input v-model="o.text" class="flex-1 border p-1" placeholder="Вариант ответа" />
        <input type="radio" :name="'correct-' + qIndex" :checked="q.correctOptionId === o._id" @change="() => q.correctOptionId = o._id" />
        <button @click="() => removeOption(qIndex, oIndex)" class="text-red-500 text-sm">&#10006;</button>
      </div>
      <button @click="() => addOption(qIndex)" class="text-sm text-blue-600">Добавить вариант</button>
    </div>

    <button @click="addQuestion" class="text-sm text-blue-600 mb-4">+ Добавить вопрос</button>

    <div class="flex gap-4">
      <button @click="saveTest" class="px-4 py-2 bg-green-600 text-white rounded">Сохранить</button>
      <button v-if="isEditing" @click="deleteTest" class="px-4 py-2 bg-red-600 text-white rounded">Удалить</button>
    </div>
  </div>
</template>

<script setup>
import { ObjectId } from 'bson';
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const test = ref({ title: '', description: '', questions: [] });
const route = useRoute();
const router = useRouter();
const isEditing = ref(false);

onMounted(async () => {
  if (route.params.id) {
    isEditing.value = true;
    const res = await fetch(`/api/tests/${route.params.id}`);
    test.value = await res.json();
  }
});

const addQuestion = () => {
  test.value.questions.push({ text: '', options: [], correctOptionId: null });
};

const addOption = (qIndex) => {
  const id = new ObjectId().toString();
  test.value.questions[qIndex].options.push({ _id: id, text: '' });
};

const removeOption = (qIndex, oIndex) => {
  const q = test.value.questions[qIndex];
  const removed = q.options.splice(oIndex, 1)[0];
  if (q.correctOptionId === removed._id) q.correctOptionId = null;
};

const saveTest = async () => {
  const url = isEditing.value ? `/api/tests/${route.params.id}` : '/api/tests';
  const method = isEditing.value ? 'PUT' : 'POST';
  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(test.value),
  });
  if (res.ok) router.push('/');
};

const deleteTest = async () => {
  if (confirm('Удалить тест?')) {
    await fetch(`/api/tests/${route.params.id}`, { method: 'DELETE' });
    router.push('/');
  }
};
</script>
