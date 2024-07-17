//DEPENDENCIAS:
//Gulp
const { src, dest, watch, parallel } = require("gulp"); // "require('gulp') => el codigo binario en "node_modules" ó "Dependencia Gulp"

//CSS
const sass = require("gulp-sass")(require("sass")); // gulp-sass, conecta sass con gulp "dependencia de desarrollo"
const plumber = require("gulp-plumber"); // plumber(), para que no interrumpa el workflow cuando marca errores
const autoprefixer = require("autoprefixer"); // de aqui para abajo es performas css
const cssnano = require("cssnano");
const postcss = require("gulp-postcss");
const sourcemaps = require("gulp-sourcemaps"); // para que nos guie a la hora de inspecionar la web

//Imagenes
const webp = require("gulp-webp"); // dependecia para convertir imagenes a .webp
const imagemin = require("gulp-imagemin"); // para conmprimir/bajar el peso de las imagenes => npm install --save-dev gulp-imagemin@7.1.0
const cache = require("gulp-cache"); // requerido con la dependencia imagemin
const avif = require("gulp-avif");

//JavaScript terser minifica codigo js => como cssnano
const terser = require("gulp-terser-js");

/***+++++++++++++++++++++++++++ Compilar función Gulp, nuestro automatizador de tarea  ***+++++++++++++++++++++++++++***/
function css(done) {
  //1. Identificamos el archivo, ejm: sass con la funcio "src" => en este caso todos src/scss/app.scss
  src("src/scss/**/*.scss")
    .pipe(sourcemaps.init())
    .pipe(plumber()) // plumber(), para que no interrumpa nuestro workflow cuando encuentre un error de compilación
    //2. compilamos a travez de "pipes" las descargas/"Dependencias", via la package.json
    .pipe(sass())
    .pipe(postcss([autoprefixer(), cssnano()]))
    .pipe(sourcemaps.write("."))
    //3. almacenamos con la funcion "dest"
    .pipe(dest("build/css"));

  done(); //callback, que avisa a gulp que hemos terminado.
}

/*** Funcion para el watch ***/
function javaScript(done) {
  src("src/js/**/*.js")
    .pipe(sourcemaps.init()) //minificamos el codigo JS
        .pipe(terser())
        .pipe(sourcemaps.write('.'))
    .pipe(dest("build/js"));

  done();
}

/* FUNCION PRINCIPAL */
function dev(done) {
  watch("src/scss/**/*.scss", css); //1º la ruta del archivo, 2ª la funcion a ejecutar
  watch("src/js/**/*.js", javaScript);

  done();
}

function versionWebp(done) {
  const opciones = {
    // => Calidad de imagen del 0 -> 100.
    quality: 50,
  };
  src("src/img/**/*.{png,jpg}") //1. Identifica de forma recursiva las extenxiones {png,jpg}
    .pipe(webp(opciones)) //2.
    .pipe(dest("build/img")); //3. Guarda en el directorio build/img
  done();
}

function versionAvif(done) {
  const opciones = {
    quality: 50,
  };
  src("src/img/**/*.{png,jpg}")
    .pipe(avif(opciones))
    .pipe(dest("build/img"));
  done();
}

// Funcion para comprimir imagenes
function imagenes(done) {
  const opciones = {
    optimizationLevel: 3,
  };
  src("src/img/**/*.{png,jpg}") //1.
    .pipe(cache(imagemin(opciones))) //2.
    .pipe(dest("build/img")); //3.
  done();
}

exports.css = css;
exports.js = javaScript;
exports.versionWebp = versionWebp;
exports.imagenes = imagenes;
exports.versionAvif = versionAvif;


exports.dev = parallel(versionWebp, imagenes, versionAvif, javaScript, dev);

/*
Diferencia entre parallel y series, ambas funciones de gulp
series => las tareas se ejecutan de forma secuencial
parallel => Las tareas se ejecutas al mismo tiempo



function tarea (done){
    console.log("Mi primer tarea");

    done();// el callback, hacemos referencia para saber que termino de ejecutar nuestra funcion
    // Es lo que se utilizaba antes de las funciones Asincronas...
}

exports.llamada = tarea; // CodigoNodeJS + <nombre> = función
//asi es como mandamos a llamar por consola con el comando "npx gulp llamada"

otro ejem => npx gulp js
*/
