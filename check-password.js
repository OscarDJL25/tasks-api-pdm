import dotenv from "dotenv";
dotenv.config();

console.log("🔍 Verificando contraseña:");
console.log("Contraseña completa:", process.env.DB_PASSWORD);
console.log("Longitud:", process.env.DB_PASSWORD?.length);
console.log("Primer carácter:", process.env.DB_PASSWORD?.charAt(0));
console.log("Último carácter:", process.env.DB_PASSWORD?.charAt(process.env.DB_PASSWORD.length - 1));
console.log("Contiene comillas:", process.env.DB_PASSWORD?.includes('"'));

// Si tiene comillas, mostrar la versión sin comillas
if (process.env.DB_PASSWORD?.includes('"')) {
    const cleanPassword = process.env.DB_PASSWORD.replace(/"/g, '');
    console.log("Contraseña sin comillas para pgAdmin:", cleanPassword);
}