const socket = io()

//elements 
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $sendLocationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')

//templates

const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

//options
const {username,room} = Qs.parse(location.search,{ignoreQueryPrefix:true})

const autoscroll =()=>{
    // new message 
    const $newMessage = $messages.lastElementChild

    // height of the new message 
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

  // visible height 
  const visibleHeight = $messages.offsetHeight
  //  height of messages container
    const containerHeight = $messages.scrollHeight
    //  how far have i scrolled
    const scrollOffset = $messages.scrollTop + visibleHeight

    if(containerHeight-newMessageHeight <= scrollOffset){
       $messages.scrollTop = $messages.scrollHeight  

    }


}
// receives from server
socket.on('welcome', (a) => {
console.log(a)
})

socket.on('message', (message) => {
    console.log(message)
    const html = Mustache.render(messageTemplate,{
        username: message.username,
        message:message.text,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})

socket.on('locationMessage', (message) => {
    console.log(message)
    const html = Mustache.render(locationTemplate, {
        username:message.username,
        URL:message.url,
        createdAt:moment(message.createdAt).format('h:mm a')
   })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('roomData', ({ room, users }) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users,
     
    })
    document.querySelector('#sidebar').innerHTML =html
})

// sends to server
$messageForm.addEventListener('submit',(e)=>{
   
   e.preventDefault()

    $messageFormButton.setAttribute('disabled','disabled')

    const message = e.target.elements.message.value

    socket.emit('sendMessage',message,(error)=>{
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value=''
        $messageFormInput.focus()

        if(error){
          return console.log(error); 
        }

        console.log('The message was delivered!',message );
    })
})

$sendLocationButton.addEventListener('click', (e) => {

    if(!navigator.geolocation){
        return alert('Geolocation is not supoorted by your browser')
    }
    $sendLocationButton.setAttribute('disabled','disabled')
   navigator.geolocation.getCurrentPosition((position)=>{
    console.log(position)
      
    socket.emit('sendLocation', {
           latitude: position.coords.latitude,
           longitude: position.coords.longitude
       },()=>{
            $sendLocationButton.removeAttribute('disabled')
            console.log(`The location details was delivered! `);
       })
   })
    
   
})


socket.emit('join',{username,room},(error)=>{
  
    if(error){
        alert(error)
        location.href='/'
    }
})