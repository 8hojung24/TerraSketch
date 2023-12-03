import React, { useEffect } from 'react';
import { firestorecode } from './firebase'; // firebase.js 파일에서 firestore를 가져옵니다.

const YourComponent = () => {
  useEffect(() => {
    const fetchData = async () => {
      try {
        const collectionRef = firestore.collection('Terraform 5.21.0 버전'); // 여기에 컬렉션명을 입력하세요

        const snapshot = await collectionRef.get();

        snapshot.forEach((doc) => {
          const data = doc.data();
          // 여기에서 특정 필드에 있는 데이터를 가져올 수 있습니다.
          // 예를 들어, 'field_name'은 가져오려는 필드명입니다.
          const fieldValue = data.code;

          // 특정 필드의 값 콘솔에 출력
          console.log(fieldValue);
        });
      } catch (error) {
        console.error('Error fetching data: ', error);
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      <h1>특정 필드 값 목록</h1>
      <ul>
        {fieldValues.map((value, index) => (
          <li key={index}>{value}</li>
        ))}
      </ul>
    </div>
     );
};

export default YourComponent;

/*
import React, { useEffect } from 'react';
import { firestorecode } from './firebase';

const test = () => {
  useEffect(() => {
    console.log(firestorecode); // 
  }, []); // useEffect의 두 번째 인자로 빈 배열을 전달하여 한 번만 실행되도록 설정

  return <div></div>;
};

export default test;*/