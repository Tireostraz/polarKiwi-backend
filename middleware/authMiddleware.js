import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

export const authenticateToken = async (req, res, next) => {
       const authHeader = req.header('Authorization');
       if (!authHeader) return res.status(401).json({ message: 'Неавторизированный запрос'});

       const token = authHeader.split(' ')[1];
       if(!token){
              res.status(401).json({ message: 'Токен отсутствует' });
       }

       try {
              const verifiedUser = jwt.verify(token, process.env.JWT_SECRET);
              req.user = verifiedUser;
              next();              
       } catch (error) {
              res.status(403).json({ message: 'Неверный или просроченный токен'});          
       }
};

export const authorizeRole = (roles) => {
       return (req, res, next) => {
              if (!roles.includes(req.user.role)) {
                     console.log(req.user)
                     return res.status(403).json({ message: 'Доступ запрещен' });
              }
              next();
       };
};