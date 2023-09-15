import {Bookmark} from '../types';
import {nanoid} from 'nanoid';

export const defaultBookmarks: Bookmark[] = [
  {
    id: nanoid(),
    title: 'Google',
    url: 'https://google.com',
    position: [-1, 0],
  },
  {
    id: nanoid(),
    title: 'Gmail',
    url: 'https://gmail.com',
    position: [0, 0],
  },
  {
    id: nanoid(),
    title: 'Twitter',
    url: 'https://twitter.com',
    position: [1, 0],
  },
]