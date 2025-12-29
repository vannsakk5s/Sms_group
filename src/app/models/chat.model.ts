export interface IMessage {
  _id?: string;
  sender: string;
  content: string;
  room: string;
  timestamp?: Date | string;
}