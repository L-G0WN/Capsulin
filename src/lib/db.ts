import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

export const getDb = async () => {
  return open({
    filename: './db.sqlite',
    driver: sqlite3.Database,
  });
};