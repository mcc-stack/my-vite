<template>
  <div>
    <input type="text" v-model="list.newTodo" @keyup.enter="addTodo" />
    <ul>
      <li v-for="item in list.todos" :key="item.id">{{ item.titile }}</li>
    </ul>
  </div>
</template>

<script>
  import { reactive } from 'vue';
  export default {
    setup() {
      const list = reactive({
        newTodo: '',
        todos: [
          { id: '1', titile: '吃饭', completed: false },
          { id: '2', titile: '睡觉', completed: false },
          { id: '3', titile: 'code', completed: false }
        ]
      });
      function addTodo(bbb) {
        list.todos.push({
          id: Math.random() * 10,
          titile: list.newTodo,
          completed: false
        });
      }
      return { list, addTodo };
    }
  };
</script>
