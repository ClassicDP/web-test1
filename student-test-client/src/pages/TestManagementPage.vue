<template>
  <div class="p-6 space-y-8">
    <section class="add-student-section">
      <form @submit.prevent="addStudent" class="add-student-form flex gap-2 mb-4">
        <input v-model="newStudent.name" placeholder="Name" required class="border p-2" />
        <input v-model="newStudent.email" type="email" placeholder="Email" required class="border p-2" />
        <button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded">Add Student</button>
      </form>
    </section>

    <table class="w-full border">
      <thead class="bg-gray-100">
      <tr>
        <th class="p-2">Name</th>
        <th class="p-2">Email</th>
        <th class="p-2">Test</th>
        <th></th>
        <th></th>
      </tr>
      </thead>
      <tbody>
      <tr v-if="!students.length">
        <td colspan="5" class="text-center p-4">No students found.</td>
      </tr>
      <tr v-for="student in students" :key="student._id">
        <td><input v-model="student.name" @blur="saveStudent(student)" class="border p-1 w-full" /></td>
        <td><input v-model="student.email" @blur="saveStudent(student)" class="border p-1 w-full" /></td>
        <td>
          <select v-model="selectedTests[student._id]" @change="onTestSelect(student)" class="border p-1 w-full">
            <option value="">-- Select Test --</option>
            <option v-for="test in tests" :key="test._id" :value="test._id">{{ test.title }}</option>
          </select>
          <div v-if="testUrls[student._id]" class="mt-1">
            <a :href="testUrls[student._id]" target="_blank" class="text-blue-600 underline text-sm">{{ testUrls[student._id] }}</a>
          </div>
        </td>
        <td>
          <button
              v-if="testUrls[student._id]"
              @click="copyToClipboard(testUrls[student._id])"
              @mouseenter="showTooltip = student._id"
              @mouseleave="showTooltip = null"
              class="text-xl"
              title="Copy URL"
          >
            📋
            <span v-if="showTooltip === student._id" class="text-green-600 text-xs ml-2">Copied!</span>
          </button>
        </td>
        <td>
          <button @click="deleteStudent(student)" class="text-red-600 text-xl" title="Delete">🗑</button>
        </td>
      </tr>
      </tbody>
    </table>
    <div v-if="students.length && !tests.length" class="text-gray-500">No tests found.</div>

    <section>
      <h2 class="text-2xl font-bold mb-4">Тесты</h2>
      <button @click="router.push('/tests/new')" class="mb-4 px-4 py-2 bg-green-600 text-white rounded">Создать новый тест</button>
      <ul class="space-y-2">
        <li v-for="test in tests" :key="test._id" class="border p-2 rounded">
          <div class="flex justify-between items-center">
            <span>{{ test.title }}</span>
            <button @click="router.push(`/tests/${test._id}/edit`)" class="text-blue-600 underline">Редактировать</button>
          </div>
        </li>
      </ul>
    </section>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

const students = ref([]);
const tests = ref([]);
const selectedTests = ref({});
const testUrls = ref({});
const showTooltip = ref(null);
const newStudent = ref({ name: '', email: '' });
const router = useRouter();

const fetchStudents = async () => {
  const res = await fetch('/api/students');
  students.value = await res.json();
};

const fetchTests = async () => {
  const res = await fetch('/api/tests');
  tests.value = await res.json();
};

const addStudent = async () => {
  const res = await fetch('/api/students', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newStudent.value),
  });
  const created = await res.json();
  students.value.push(created);
  newStudent.value = { name: '', email: '' };
};

const deleteStudent = async (student) => {
  await fetch(`/api/students/${student._id}`, { method: 'DELETE' });
  students.value = students.value.filter(s => s._id !== student._id);
};

const saveStudent = async (student) => {
  await fetch(`/api/students/${student._id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(student),
  });
};

const onTestSelect = async (student) => {
  const testId = selectedTests.value[student._id];
  if (!testId) return;
  const res = await fetch('/api/students/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ studentId: student._id, testId }),
  });
  const data = await res.json();
  testUrls.value[student._id] = data.testUrl;
};

const copyToClipboard = async (text) => {
  await navigator.clipboard.writeText(text);
};

onMounted(() => {
  fetchStudents();
  fetchTests();
});
</script>
