import { Router } from 'express';
import bcrypt from "bcrypt"
import UserManager from '../../dao/mongomanagers/userManager.js';

export const dbM = new UserManager()

// Importar todos los routers;
export const router = Router();
let encryptRounds = 1


router.post("/login", async (req, res) => {

    try {
        const { email, password } = req.body

        if (email == undefined || password == undefined) return res.status(400).json({ success: false, error: "Faltan datos" })
        let finded = await dbM.findeUserByEmail(email.toString().toLowerCase())
        if (!finded.success) return res.status(200).json({ success: false, error: "usuario no encontrado" })
        let user = JSON.parse(JSON.stringify(finded.success))
        if (bcrypt.compareSync(password, user.password)) {
            console.log(user.first_name)
            req.session.email = user.email
            req.session.password = user.password
            req.session.name = user.first_name
            req.session.age = user.age
            req.session.adminRole = user.adminRole

            res.status(200).json({ result: true })

        }
        else {
            res.status(400).json({ success: false, error: "Contraseña incorrecto" })
        }

    } catch (e) {
        res.status(500).json({ status: "error", error: e.message })
    }
})

router.get("/pep", async (req, res) => {

})

router.delete('/logout', (req, res) => {

    try {
        req.session.destroy(() => {
            res.status(200).json({ success: true, msg: "Session finalizada" })

        })
    } catch (error) {
        res.status(400).json({ success: false, error: error.message })

    }
})
// Endpoint para traer el producto solicitado by id en el params


router.post("/register", async (req, res) => {
    const {
        first_name,
        last_name,
        email,
        age,
        password,
    } = req.body
    if (first_name !== undefined && last_name !== undefined && email !== undefined && age !== undefined && password !== undefined) {

        try {
            let obj = {}

            obj.first_name = first_name.toString()
            obj.last_name = last_name.toString()
            obj.email = email.toString().toLowerCase()
            obj.age = parseFloat(age)
            obj.password = bcrypt.hashSync(password, encryptRounds);

            let newUser = await dbM.createUser(obj)
            if (!newUser.success) res.status(400).json({ error: "no se pudo crear" })
            // return res.redirect("../../login")
            res.status(200).json({ result: newUser.success })
        } catch (e) {
            res.status(500).json({ error: e.message })
        }
    } else return res.status(400).json({ error: "Faltan campos obligatorios" })

})