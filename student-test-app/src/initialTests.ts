import mongoose from 'mongoose';
import {TestModel} from "./models/all";

export const programmingTestData = {
    title: 'Тест на знание JavaScript/TypeScript',
    description: 'Проверка базовых знаний по JS/TS для начинающих разработчиков',
    questions: [
        { text: 'Как объявить переменную в JavaScript?', options: ['var', 'variable', 'let ='], correct: 0 },
        { text: 'Какой тип вернёт typeof null?', options: ['null', 'object', 'undefined'], correct: 1 },
        { text: 'Как объявить тип переменной в TypeScript?', options: ['let x: number;', 'let x = number;', 'let: number x'], correct: 0 },
        { text: 'Что такое NaN в JavaScript?', options: ['Синтаксическая ошибка', 'Число', 'Тип данных'], correct: 1 },
        { text: 'Какой результат выражения 0 == false?', options: ['true', 'false', 'undefined'], correct: 0 },
        { text: 'Какой результат выражения 0 === false?', options: ['true', 'false', 'undefined'], correct: 1 },
        { text: 'Что делает оператор "typeof"?', options: ['Проверяет тип значения', 'Преобразует в строку', 'Удаляет свойство'], correct: 0 },
        { text: 'Какой метод используется для преобразования JSON в объект?', options: ['JSON.stringify()', 'JSON.toObject()', 'JSON.parse()'], correct: 2 },
        { text: 'Что такое интерфейс в TypeScript?', options: ['Объект', 'Описание структуры объекта', 'Функция'], correct: 1 },
        { text: 'Можно ли присвоить строку переменной типа number в TypeScript?', options: ['Да', 'Нет', 'Иногда'], correct: 1 },
        { text: 'Что делает "===" в JavaScript?', options: ['Сравнивает значения с приведением типов', 'Сравнивает без приведения типов', 'Присваивает значения'], correct: 1 },
        { text: 'Как объявить массив чисел в TypeScript?', options: ['let arr: number[];', 'let arr = [number];', 'number arr[];'], correct: 0 },
        { text: 'Как проверить, является ли переменная массивом?', options: ['typeof arr === "array"', 'arr instanceof Array', 'arr.isArray()'], correct: 1 },
        { text: 'Какой результат у "2" + 2 в JS?', options: ['22', '4', 'NaN'], correct: 0 },
        { text: 'Что такое enum в TypeScript?', options: ['Функция', 'Класс', 'Перечисление'], correct: 2 },
        { text: 'Можно ли переопределить тип переменной в TS?', options: ['Да, через "as"', 'Нет', 'Да, через typeof'], correct: 0 },
        { text: 'Как объявить тип функции в TypeScript?', options: ['(a: number) => number', 'func(a:number):number', 'function(a:number):number'], correct: 0 },
        { text: 'Что вернёт typeof [1,2,3]?', options: ['array', 'object', 'number'], correct: 1 },
        { text: 'Как создать неизменяемую переменную?', options: ['let', 'const', 'var'], correct: 1 },
        { text: 'Что такое "any" в TypeScript?', options: ['Тип "любой"', 'Ошибка компиляции', 'Слово ключевое для async'], correct: 0 }
    ].map(q => {
        const optionsWithIds = q.options.map(text => ({ _id: new mongoose.Types.ObjectId(), text }));
        return {
            text: q.text,
            options: optionsWithIds,
            correctOptionId: optionsWithIds[q.correct]._id
        };
    })
};



export async function initProgrammingTest() {
    const existing = await TestModel.findOne({ title: programmingTestData.title });
    if (!existing) {
        await TestModel.create(programmingTestData);
        console.log('Programming test created');
    } else if (!existing.questions || existing.questions.length === 0) {
        existing.questions = programmingTestData.questions.map(q => ({ ...q })) as any;
        await existing.save();
        console.log('Programming test questions updated');
    } else {
        console.log('Programming test already exists');
    }
}

// Для инициализации теста вызови initProgrammingTest() после подключения к БД на сервере.
