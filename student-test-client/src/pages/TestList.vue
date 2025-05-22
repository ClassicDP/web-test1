<template>
  <div class="p-4">
    <h2 class="text-xl font-bold mb-4">Список тестов</h2>
    <button @click="goToNewTest" class="mb-4 px-4 py-2 bg-blue-500 text-white rounded">Создать новый тест</button>
    <ul v-if="tests.length">
      <li v-for="test in tests" :key="test._id" class="mb-2">
        <span class="font-medium">{{ test.title }}</span>
        <button @click="editTest(test._id)" class="ml-2 text-blue-600 underline">Редактировать</button>
      </li>
    </ul>
    <p v-else>Нет тестов.</p>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const tests = ref([]);
const router = useRouter();

const fetchTests = async () => {
  const res = await fetch('/api/tests');
  tests.value = await res.json();
};

const editTest = (id) => router.push(`/tests/${id}/edit`);
const goToNewTest = () => router.push('/tests/new');

onMounted(fetchTests);
</script>
