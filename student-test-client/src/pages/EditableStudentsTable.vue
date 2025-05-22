<template>
  <div>
    <section class="add-student-section">
      <form @submit.prevent="addStudent" class="add-student-form">
        <input v-model="newStudent.name" placeholder="Name" required />
        <input v-model="newStudent.email" type="email" placeholder="Email" required />
        <button type="submit" class="add-button">Add Student</button>
      </form>
    </section>
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
          <input v-model="student.name" @blur="saveStudent(student)" />
        </td>
        <td>
          <input v-model="student.email" @blur="saveStudent(student)" />
        </td>
        <td>
          <div>
            <select v-model="selectedTests[student._id]" @change="onTestSelect(student)">
              <option value="">-- Select Test --</option>
              <option v-for="test in tests" :key="test._id" :value="test._id">{{ test.title }}</option>
            </select>
          </div>
          <div v-if="testUrls[student._id]" class="test-url">
            <a :href="testUrls[student._id]" target="_blank" class="test-link">
              {{ testUrls[student._id] }}
            </a>
          </div>
        </td>
        <td>
          <button
              v-if="testUrls[student._id]"
              @click="copyToClipboard(testUrls[student._id])"
              title="Copy URL"
              class="copy-button"
              @mouseenter="showTooltip = student._id"
              @mouseleave="showTooltip = null"
          >
            📋
            <span v-if="showTooltip === student._id" class="tooltip">Copied!</span>
          </button>
        </td>
        <td>
          <button @click="deleteStudent(student)" title="Delete Student" class="delete-button">🗑</button>
        </td>
      </tr>
      </tbody>
    </table>
    <div v-if="students.length && !tests.length" class="no-tests-message">No tests found.</div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, watch } from 'vue';
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
    const showTooltip = ref<string | null>(null);
    let tooltipTimeout: ReturnType<typeof setTimeout> | null = null;

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
        students.value = studentsRes.data;
        tests.value = testsRes.data;
      } catch (e) {
        console.error('Failed to load data:', e);
      }
    });

    const saveStudent = async (student: any) => {
      try {
        await axios.put(`/api/students/${student._id}`, {
          name: student.name,
          email: student.email,
        });
      } catch (e) {
        console.error('Failed to save student:', e);
      }
    };

    const onTestSelect = async (student: any) => {
      const testId = selectedTests.value[student._id];
      if (!testId || !student._id) {
        testUrls.value[student._id] = '';
        return;
      }
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
      navigator.clipboard.writeText(text).then(() => {
        if (tooltipTimeout) clearTimeout(tooltipTimeout);
        showTooltip.value = Object.keys(testUrls.value).find(key => testUrls.value[key] === text) || null;
        tooltipTimeout = setTimeout(() => {
          showTooltip.value = null;
        }, 500);
      });
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
      showTooltip,
    };
  },
});
</script>

<style scoped>
.add-student-section {
  margin-bottom: 1.5em;
  padding: 1em;
  background-color: #f9f9f9;
  border-radius: 6px;
  box-shadow: 0 0 8px rgba(0,0,0,0.05);
}

.add-student-form {
  display: flex;
  gap: 0.75em;
  flex-wrap: wrap;
  align-items: center;
}

.add-student-form input {
  flex: 1 1 200px;
  padding: 0.5em 0.75em;
  font-size: 1rem;
  border: 1px solid #bbb;
  border-radius: 6px;
  transition: border-color 0.2s ease;
}

.add-student-form input:focus {
  outline: none;
  border-color: #2d8cf0;
  box-shadow: 0 0 5px rgba(45,140,240,0.5);
}

.add-button {
  padding: 0.5em 1.2em;
  background-color: #2d8cf0;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.add-button:hover {
  background-color: #1a6ed8;
}

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

input[type="text"], input[type="email"], select {
  width: 100%;
  padding: 0.4em 0.6em;
  font-size: 1rem;
  border: 1px solid #bbb;
  border-radius: 4px;
  transition: border-color 0.2s ease;
}

input[type="text"]:focus, input[type="email"]:focus, select:focus {
  outline: none;
  border-color: #2d8cf0;
  box-shadow: 0 0 5px rgba(45,140,240,0.5);
}

.test-url {
  margin-top: 0.25em;
  font-size: 0.9em;
  word-break: break-all;
}

.test-link {
  color: #2d8cf0;
  text-decoration: underline;
  font-weight: 600;
}

.copy-button {
  cursor: pointer;
  background: none;
  border: none;
  font-size: 1.3em;
  position: relative;
  color: #4a90e2;
  transition: color 0.2s ease;
}

.copy-button:hover {
  color: #1a6ed8;
}

.tooltip {
  position: absolute;
  top: -1.5em;
  left: 50%;
  transform: translateX(-50%);
  background: #2d8cf0;
  color: white;
  padding: 0.15em 0.5em;
  border-radius: 4px;
  font-size: 0.75em;
  white-space: nowrap;
  pointer-events: none;
  opacity: 0.9;
  user-select: none;
}

.delete-button {
  cursor: pointer;
  background: none;
  border: none;
  font-size: 1.3em;
  color: #d9534f;
  transition: color 0.2s ease;
}

.delete-button:hover {
  color: #c9302c;
}

.no-tests-message {
  margin-top: 1em;
  font-style: italic;
  color: #666;
}
</style>