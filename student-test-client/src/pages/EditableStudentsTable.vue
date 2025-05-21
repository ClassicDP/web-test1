<template>
  <div>
    <form @submit.prevent="addStudent" class="add-student-form">
      <input v-model="newStudent.name" placeholder="Name" required />
      <input v-model="newStudent.email" type="email" placeholder="Email" required />
      <button type="submit">Add Student</button>
    </form>
    <table>
      <thead>
      <tr>
        <th>Name</th>
        <th>Email</th>
        <th>Test</th>
        <th></th>
        <th></th>
      </tr>
      </thead>
      <tbody>
      <tr v-if="!students.length"><td colspan="5">No students found.</td></tr>
      <tr v-for="student in students" :key="student._id" v-else>
        <td>
          <input v-model="student.name" @change="saveStudent(student)" />
        </td>
        <td>
          <input v-model="student.email" @change="saveStudent(student)" />
        </td>
        <td>
          <div>
            <select v-model="selectedTests[student._id]" @change="onTestSelect(student)">
              <option value="">-- Select Test --</option>
              <option v-for="test in tests" :key="test._id" :value="test._id">{{ test.title }}</option>
            </select>
          </div>
          <div v-if="testUrls[student._id]" style="margin-top: 0.25em; font-size: 0.9em; word-break: break-all;">
            <a :href="testUrls[student._id]" target="_blank" style="color: #2d8cf0; text-decoration: underline;">
              {{ testUrls[student._id] }}
            </a>
          </div>
        </td>
        <td>
          <button
              v-if="testUrls[student._id]"
              @click="copyToClipboard(testUrls[student._id])"
              title="Copy URL"
          >
            📋
          </button>
        </td>
        <td>
          <button @click="deleteStudent(student)" title="Delete Student">🗑</button>
        </td>
      </tr>
      </tbody>
    </table>
    <div v-if="students.length && !tests.length">No tests found.</div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import axios from 'axios';

export default defineComponent({
  name: 'EditableStudentsTable',
  setup() {
    const students = ref<any[]>([]);
    const tests = ref<any[]>([]);
    const selectedTests = ref<{ [key: string]: string }>({});
    const testUrls = ref<{ [key: string]: string }>({});
    const newStudent = ref<{ name: string; email: string }>({
      name: '',
      email: '',
    });

    const seedTests = async () => {
      try {
        const testsRes = await axios.get('/api/tests');
        if (testsRes.data.length === 0) {
          const newTest = { title: 'Default Test' };
          await axios.post('/api/tests', newTest);
        }
      } catch (e) {
        console.error('Failed to seed tests:', e);
      }
    };

    onMounted(async () => {
      try {
        await seedTests();
        const [studentsRes, testsRes] = await Promise.all([
          axios.get('/api/students'),
          axios.get('/api/tests'),
        ]);
        console.log('Students:', studentsRes.data);
        console.log('Tests:', testsRes.data);
        students.value = studentsRes.data;
        tests.value = testsRes.data;
      } catch (e) {
        console.error('Failed to load data:', e);
      }
    });

    const saveStudent = async (student: any) => {
      try {
        await axios.patch(`/api/students/${student._id}`, {
          name: student.name,
          email: student.email,
        });
      } catch (e) {
        console.error('Failed to save student:', e);
      }
    };

    const onTestSelect = async (student: any) => {
      const testId = selectedTests.value[student._id];
      // Check that both testId and student._id exist and are non-empty
      if (!testId || !student._id) {
        testUrls.value[student._id] = '';
        return;
      }
      // Debug log
      console.log('Registering:', { studentId: student._id, testId });
      try {
        const res = await axios.post('/api/students/register', {
          studentId: student._id,
          testId,
        });
        const url = `${window.location.origin}/attempt/${res.data.registration.uniqueUrl}`;
        testUrls.value[student._id] = url;
      } catch (e) {
        console.error('Failed to register test:', e);
      }
    };

    const copyToClipboard = (text: string) => {
      navigator.clipboard.writeText(text);
    };

    const addStudent = async () => {
      try {
        const res = await axios.post('/api/students', {
          name: newStudent.value.name,
          email: newStudent.value.email,
        });
        students.value.push(res.data);
        newStudent.value.name = '';
        newStudent.value.email = '';
      } catch (e) {
        console.error('Failed to add student:', e);
      }
    };

    const deleteStudent = async (student: any) => {
      try {
        await axios.delete(`/api/students/${student._id}`);
        students.value = students.value.filter(s => s._id !== student._id);
        delete selectedTests.value[student._id];
        delete testUrls.value[student._id];
      } catch (e) {
        console.error('Failed to delete student:', e);
      }
    };

    return {
      students,
      tests,
      selectedTests,
      testUrls,
      newStudent,
      saveStudent,
      onTestSelect,
      copyToClipboard,
      addStudent,
      deleteStudent,
    };
  },
});
</script>

<style scoped>
table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1em;
}

th, td {
  border: 1px solid #ccc;
  padding: 0.5em;
  text-align: left;
}

.add-student-form {
  display: flex;
  gap: 0.5em;
  margin-bottom: 1em;
  flex-wrap: wrap;
  align-items: center;
}

.add-student-form input,
.add-student-form select {
  padding: 0.4em;
  font-size: 1em;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.add-student-form button {
  padding: 0.5em 1em;
  font-size: 1em;
  background-color: #2d8cf0;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.add-student-form button:hover {
  background-color: #1a6ed8;
}

button {
  cursor: pointer;
  background: none;
  border: none;
  font-size: 1.2em;
}

button[title="Delete Student"] {
  color: #d9534f;
}

button[title="Delete Student"]:hover {
  color: #c9302c;
}
</style>