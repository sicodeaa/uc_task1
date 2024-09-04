const postsList = document.querySelector('.post-list');
const addPostForm = document.querySelector('.add-post-form');
const titleValue = document.getElementById('title-value');
const bodyValue = document.getElementById('body-value');
const btnSubmit = document.querySelector('.btn');

let postsArray = []; 
let currentUserId = null; 

const renderPosts = (posts) => {
  let output = ''; 
  posts.forEach(post => {
    output += `
      <div class="card mt-4 col-md-6 bg-light">
        <div class="card-body" data-userId="${post.userId}">
          <h5 class="card-title">${post.title}</h5>
          <h6 class="card-subtitle mb-2 text-body-secondary">${post.userId}</h6>
          <p class="card-text">${post.body}</p>
          <a href="#" class="card-link" id="edit-post">Edit</a>
          <a href="#" class="card-link" id="delete-post">Delete</a>
        </div>
      </div>
    `;
  });
  postsList.innerHTML = output;
}

const url = 'https://dummyjson.com/posts';

// GET - Read the posts
// Method GET
const getPosts = async () => {
  try {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await res.json();
    postsArray = data.posts; 
    renderPosts(postsArray);
  } catch (error) {
    console.error('Fetch error:', error);
  }
};
getPosts();

// CREATE - Insert A New Post
// Method: POST
addPostForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  try {
    const res = await fetch('https://dummyjson.com/posts/add', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title: titleValue.value,
        body: bodyValue.value,
        userId: Math.floor(Math.random() * 200) + 1,
      })
    });
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(errorText);
    }
    const data = await res.json();
    postsArray.push(data); 
    renderPosts(postsArray); 
  } 
  catch (error) {
    console.error('Fetch error:', error);
  }
  // reset input field to empty
  titleValue.value = '';
  bodyValue.value = '';
});

postsList.addEventListener('click', (e) => {
  let deleteButtonIsPressed = e.target.id == 'delete-post';
  let editButtonIsPressed = e.target.id == 'edit-post';

  if (deleteButtonIsPressed || editButtonIsPressed) {
    
    const userId = e.target.closest('.card-body').dataset.userid;
    console.log(`User ID: ${userId}`); 

    if (deleteButtonIsPressed) {
      // DELETE - Remove existing post
      fetch(`${url}/${userId}`, {
        method: 'DELETE',
      })
      .then(res => {
        if (!res.ok) {
          throw new Error('Network response was not ok');
        }
        return res.json();
      })
      .then(() => {
        
        postsArray = postsArray.filter(post => post.userId != userId);
        renderPosts(postsArray);
      })
      .catch(error => console.error('Error:', error));
    }

    if (editButtonIsPressed) {
      const parent = e.target.parentElement;
      let titleContent = parent.querySelector('.card-title').textContent;
      let bodyContent = parent.querySelector('.card-text').textContent;

      titleValue.value = titleContent;
      bodyValue.value = bodyContent;
      currentUserId = userId; 
    }
  }
});

// Update - Update the existing post
// Method: PATCH
btnSubmit.addEventListener('click', (e) => {
  e.preventDefault();
  if (currentUserId) {
    fetch(`${url}/${currentUserId}`, {
      method: 'PATCH',
      headers: {
        'Content-type': 'application/json'
      },
      body: JSON.stringify({
        title: titleValue.value,
        body: bodyValue.value,
      })
    })
    .then(res => {
      if (!res.ok) {
        throw new Error('Network response was not ok');
      }
      return res.json();
    })
    .then(updatedPost => {
      
      postsArray = postsArray.map(post => post.userId == currentUserId ? updatedPost : post);
      renderPosts(postsArray); 
      currentUserId = null; 
    })
    .catch(error => console.error('Error:', error));
  }
  
  // reset input field to empty
  titleValue.value = '';
  bodyValue.value = '';
});
