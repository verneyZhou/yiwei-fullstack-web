import React from 'react';
import { View, Text } from '@tarojs/components';
import { useNavigate } from 'react-router-dom';

export default function NotFound() {
  const navigate = useNavigate();
  
  const goBack = () => {
    navigate('/');
  };
  
  return (
    <View className='not-found-container' style={{ padding: '30px', textAlign: 'center' }}>
      <Text style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px', display: 'block' }}>404</Text>
      <Text style={{ fontSize: '16px', color: '#666', marginBottom: '30px', display: 'block' }}>页面不存在</Text>
      <View 
        className='back-button'
        onClick={goBack}
        style={{
          backgroundColor: '#4a90e2',
          color: 'white',
          padding: '10px 20px',
          borderRadius: '5px',
          display: 'inline-block',
          cursor: 'pointer'
        }}
      >
        返回首页
      </View>
    </View>
  );
}