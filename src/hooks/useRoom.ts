// Carregamento dos dados da sala

import { useEffect } from "react";
import { useState } from "react";
import { database } from "../services/firebase";
import { useAuth } from "./useAuth";


type FirebaseQuestions = Record<string,  {
    author: {
      name: string;
      avatar: string;
    }
   
    content: string;
    isAnswered: boolean;
    isHighlighted:boolean;
    likes: Record<string, {
      authorId: string;
    }>
   }>
   
   type QuestionType = {
     id: string;
     author: {
       name: string;
       avatar: string;
     }
    
     content: string;
     isAnswered: boolean;
     isHighlighted:boolean;
     likeCount: number;
     likeId: string | undefined;
     
   }

export function useRoom(roomId: string) {
  const { user } = useAuth();
    const [questions, setQuestions] = useState <QuestionType[]>([])
    const [ title, setTitle ] = useState('');

    useEffect(() => {
        const roomRef = database.ref(`rooms/${roomId}`);
    
        roomRef.on('value', room => {
          const databaseRoom = room.val();
          const firebaseQuestions: FirebaseQuestions = databaseRoom.questions ?? {};
       
          // Para aparecer os dados atualizados em tela - "on" ouvindo
          const parsedQuestions = Object.entries(firebaseQuestions).map(([key, value]) => {
          return{
          id: key,
          content:value.content,
          author: value.author,
          isHighlighted: value.isHighlighted,
          isAnswered: value.isAnswered,
          likeCount: Object.values(value.likes ?? {}).length,  //Quantidade de likes
          likeId: Object.entries(value.likes ?? {}).find(([key, like]) => like.authorId == user?.id)?.[0],

          //o "some" só retorna true ou false. Se encontou ou não, ele vai procurar uma condição que satisfaça(aqui nesse caso é se o usuário deu like ou não)
        } 
        })
        setTitle(databaseRoom.title);
        setQuestions(parsedQuestions)
      })
    return () => {
      roomRef.off('value');
    }
      }, [roomId, user?.id]);

      return{questions, title}
}