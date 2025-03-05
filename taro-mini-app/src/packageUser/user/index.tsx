import React, { useState, useEffect } from 'react';
import { View, Text, Button, Image } from '@tarojs/components';


const Home = () => {
  const [name, setName] = useState('');

  useEffect(() => {
    console.log('====name change');
  }, [name]);


  const changeName = () => {
    const _name = +new Date();
    setName(`新名字${_name}`);
  };

  return (
    <View className='wrapper'>
      <Text>{name}</Text>
      <Button onClick={changeName}>change name</Button>
    </View>
  );
};

export default Home;
