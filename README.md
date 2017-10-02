# crezerbero
telegram bot in nodeJS and Arduino to open the creze office door

## Como se usa?
Este bot tiene 2 tipos de usuarios, administradores y usuarios comunes.

### Como usuario comun:
1. El primer paso es buscar el bot para iniciar conversacion, en el campo de busqueda de telegram debemos poner
```txt
crz_door_bot
```
seleccionamos el bot llamado "crezerbero" e iniciamos conversacion con el, ya sea usando el boton que dice "iniciar" o escribiendo
```
/start
```
en la caja de texto y enviandolo

2. El bot nos dara la bienvenido y procedemos a ingresar la contraseña para registrarnos como usuarios, escribimos:
```
/password aquiLaContraseña
```
con la contraseña correspondiente

3. ahora la unica tarea del bot es habilitar el motor de la puerta para permitir el paso, para eso podemos dar click en el boton que dice ```/alohomora``` o podemos escribir:
```
alohomora
```
y enviarselo al bot para que nos habra la puerta

### Como administrador
Primero debemos registrarnos como administradores asi que ya en la ventana de conversacion del bot procedemos a escribr:
```
/becomeAdmin PasswordDeAdminAqui
```
esperamos la respuesta del bot confirmando nuestro registro y listo, quedamos registrados como administradores y podemos ejecutar las siguientes tareas:
- /listUsers
- /turnOn
- /turnOff
- /getStatus
Detallamos cada una:

#### /listUsers
Esta accion nos arroja un listado de los administradores y usuaios registrados y autorizados para usar el bot

#### /turnOn
Esta accion activa la funcion para abrir la puerta.

### /turnOff
Estaa accion desactiva la fucnion para abrir la puerta, sin apagar el dispositivo

### /getStatus
esta accion nos deja saber la fecha y hora en que se puso a correr el servidor del bot y el estatus del dispositivo (activado o desactivado)

## Para desarrolladores:
Para correr este codigo es necesario crear un archivo ```.env``` en la raiz del proyecto, este debe contener el token del bot para el API de telegram y las contraseñas para usuarios y administradores con la siguiete sintaxis:
```dotenv
# ./.env
BOT_ACCESS_TOKEN = "ToK3nTel3g4m"
BOT_PASSWORD = "Pa22w0rd_usuario"
ADMIN_BOT_PASSWORD = "Pa22w0rd_admin"
```
