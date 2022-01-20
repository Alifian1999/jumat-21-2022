function submitData(event){
    event.preventDefault();
 const firstName= document.getElementById('firstName').value
 const lastName= document.getElementById('last-name').value
 const email= document.getElementById('email').value
 const phone= document.getElementById('phone').value
 const textArea= document.getElementById('text-area').value
 const subject= document.getElementById('input-subject').value
 
 
       let skillHtml =  document.getElementById('html').checked
       let skillCss =  document.getElementById('css').checked
 
       // kondisi untuk mengecek apakah checkbox di ceklis, kalau di ceklis maka tampilkan/ambil valuenya
       if (skillHtml) {
          skillHtml = (document.getElementById('html').value);
          
       // jika tidak di ceklis maka tampilkan string kosong 
       } else {
          skillHtml = ""
       } 
 
       if (skillCss) {
          skillCss = (document.getElementById('css').value);
       } else {
          skillCss = ""
       }
 
       console.log(firstName);
       console.log(email);
       console.log(phone);
       console.log(subject);
       console.log(textArea);
       console.log(skillHtml);
       console.log(skillCss);
 
 
 
     if(firstName ==''){
        return document.querySelector('.first-small').innerHTML='*first name tidak boleh kosong'
     }else if(lastName==''){
        return document.querySelector('.last-small').innerHTML='*last name tidak boleh kosong'
     }else if(email==''){
        return document.querySelector('.email-small').innerHTML='*Email tidak boleh kosong'
     }else if(phone==''){
        return document.querySelector('.phone-small').innerHTML='*Phone number tidak boleh kosong'
     }else if(subject==''){
       return document.querySelector('.subject-small').innerHTML='*select purpose tidak boleh kosong'
     }else if(textArea ==''){
         return alert('text area wajib di isi')
     }
 
     const emailReceiver = 'chevesar1999@gmail.com'
     let a = document.createElement('a')
 
     a.href = `mailto: ${emailReceiver}?subject=${subject}&body=Hallo my name ${`${firstName}  ${lastName}`} ${textArea} contact me ${phone} send CV ${email} requirment skill ${skillHtml} ${skillCss}`
     a.click()
     
 
     let dataObject = {
       name: `${firstName}  ${lastName}`,
       email: email,
       phoneNumber: phone,
       subject: subject,
       textArea: textArea,
       skillHtml: skillHtml,
       skillCss: skillCss
   }
 
   console.log(dataObject);
 }
 