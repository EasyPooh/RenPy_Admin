import React from 'react'

function Title(props) {

  console.log(props); 
  return (
    <div>Title... {props.txt}
    price = {props.price}</div>
  )
}

export default Title   