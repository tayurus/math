Методы:

- регистрация:
  - метод: POST
  - url: /register
  - headers: {content-type: 'application/json'}
  - body: {name: string} - name не может быть пустым
  - response: {id: number} - id зарегистрированного пользователя
    fetch('http://localhost:8000/register', {headers: {'Content-Type': 'application/json'}, method: 'POST',body: JSON.stringify({name: 'test'})})
