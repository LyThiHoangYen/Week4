import React, { useEffect, useState } from 'react';
import { View, TextInput, Button, Text, FlatList } from 'react-native';
import { initDatabase, getDb } from './database';

export default function App() {
  const [word, setWord] = useState('');
  const [results, setResults] = useState([]);
  const [isDbReady, setIsDbReady] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        await initDatabase();
        console.log('✅ Database initialized');
        setIsDbReady(true);
      } catch (err) {
        console.log('❌ Init DB failed:', err);
      }
    };
    init();
  }, []);

  const searchWord = () => {
    if (!word.trim()) return;
    const db = getDb();
    console.log('🔍 Searching for:', word);
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM words WHERE word = ?',
        [word],
        (_, result) => {
          if (result.rows.length > 0) {
            const data = [];
            for (let i = 0; i < result.rows.length; i++) {
              data.push(result.rows.item(i));
            }
            console.log('✅ Exact match rows:', JSON.stringify(data, null, 2));
            setResults(data);
            
          } else {
            tx.executeSql(
              'SELECT * FROM words WHERE word LIKE ?',
              [`%${word}%`],
              (_, likeResult) => {
                const likeData = likeResult.rows._array;
                console.log('🔍 Partial matches:', JSON.stringify(likeData, null, 2));
                setResults(likeData);
              },
              (_, error) => console.log('❌ LIKE error:', error)
            );
          }
        },
        (_, error) => console.log('❌ SELECT error:', error)
      );
    });
  };

  return (
    <View style={{ padding: 20, marginTop: 40 }}>
      <TextInput
        placeholder="Enter a word"
        value={word}
        onChangeText={setWord}
        style={{
          borderWidth: 1,
          padding: 10,
          marginBottom: 10,
        }}
      />
      <Button title="LOOKUP" onPress={searchWord} disabled={!isDbReady} />
      <FlatList
        data={results}
        keyExtractor={(item, index) => item.id?.toString() ?? index.toString()}
        renderItem={({ item }) => (
          <View style={{ marginTop: 10 }}>
            <Text style={{ fontWeight: 'bold' }}>{item.word}</Text>
            <Text>{item.definition}</Text>
          </View>
        )}
      />
    </View>
  );
}
