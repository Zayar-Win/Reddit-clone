import jwt, { JwtPayload } from 'jsonwebtoken'
import { isBuffer } from 'util'


export const jwtSecret = "this is jwt secret."

interface payloadProps{
    id : number
}

export const singJwt =  (payload : payloadProps) => {
    const token = jwt.sign(payload,jwtSecret,{
        expiresIn:1000 * 60 * 5,
    })

    return token;
}

export const verifyToken = (token : string) => {
    try{
        const decoded = jwt.verify(token,jwtSecret) as unknown as JwtPayload
        return decoded;
    }catch(err){
        console.log(err)
        return null
    }

}