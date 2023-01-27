import { STUDENTS_DATA_CSV_URL } from './globals.js'
import { loadCSVFrom, getJSONArrayFrom, fetchViaProxy, saveLetters } from './utils.js'
import { storeArray, getStoredArray } from './storage.js'


(async () => {
  console.log('started execution')

  const finalStudentsDataJSON = getStoredArray('students')

console.log(finalStudentsDataJSON)

  const studentsDataCSV = await loadCSVFrom(STUDENTS_DATA_CSV_URL);

  const studentsDataJSON = getJSONArrayFrom(studentsDataCSV)

  await saveLetters(studentsDataJSON)

  console.log('execution ended')
})();



//loop through each object
//fetch the pdf
//extract as text
//extract info from it
//save current pdf to cache
//add current info to json variable


//zip it up and download

//notes//
//check for any saved before starting to fetch letter