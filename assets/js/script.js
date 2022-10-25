const v88 = (element_selector) => {
  let self = (typeof element_selector === "string") ? document.querySelector(element_selector) : element_selector;

  return {
    /** Extend the prototype of the HTML element/node */
    ...self,
    get: ()=> {
      /** Use get() to access primitive methods/properties of the element */
      return self;
    },
    on: (event_name, event_callback = null) => {
      self.addEventListener(event_name, (event) => {
        (typeof event_callback === "function") && event_callback(event);
      });
      return v88(self);
    },
    find: (child_selector) => {
      return v88(self.querySelector(child_selector));
    },
    addClass: (class_name) => {
      self.classList.add(class_name);
      return self;
    },
    removeClass: (class_name) => {
      self.classList.remove(class_name);
      return self;
    },
    text: (text_value) => {
      self.innerText = text_value;
      return self;
    },
    copy: () => {
      let clone = self.cloneNode(true);
      return v88(clone);
    },
    append: (child_node) => {
      self.appendChild((child_node.hasOwnProperty("on")) ? child_node.get() : v88(child_node));
      return self;
    },
    getParent: () => {
      return v88(self.parentNode);
    },
    trigger: (event_name) => {
      self.dispatchEvent(new Event(event_name));
      return self;
    },
    hasClass: (class_name) =>{
      return self.classList.contains(class_name);
    }
  }
}

let write_post_form = v88("#write_post_form");
let login_form = v88("#login_form")
let signup_form = v88("#signup_form");

login_form.get() && login_form.on("submit", submitUserForm);
signup_form.get() && signup_form.on("submit", submitUserForm);

if(write_post_form.get()){
  write_post_form.on("submit", submitPostForm)
    .find("textarea").on("keyup", textareaKeyUp);
}

function submitUserForm(event){
  event.preventDefault();
  let user_form = v88(event.target);
  let user_form_data = new FormData(event.target);
  let allow_user_login = true;
  let user_password = "";
  let error_field = v88(".error_field");
  error_field.get() && error_field.removeClass("error_field");
  v88(".error_messages").text("");

  /** Validate user form values */
  for(let [field_name, field_value] of user_form_data){
    /** Field should not be empty */
    if(!field_value){
      user_form.find("."+ field_name).addClass("error_field");
      allow_user_login = false;
    }
    else{
      /** Store Password for latter comparison */
      user_password = (field_name === "password") ? field_value : user_password;

      /** Password and confirm password should match */
      if(field_name === "confirm_password" && field_value !== user_password){
        allow_user_login = false;
        v88(".error_messages").text("Passwords do not match");
        user_form.find(".password").addClass("error_field");
        user_form.find("."+ field_name).addClass("error_field");
      }
    }
  }

  /** If all fields are valid, redirect to wall */
  if(allow_user_login){
    window.location = "wall.html";
  }

  return false;
}

function submitPostForm(event){
  event.preventDefault();

  if(write_post_form.find("#post_content").get().value.length){
    let post_item_clone = v88(".wall_post_item_clone").copy();
    post_item_clone.removeClass("wall_post_item_clone");
    v88("#wall_posts_list").append(post_item_clone);
  
    post_item_clone.find(".post_content").text(write_post_form.find("#post_content").get().value);
  
    /** Bind submit event to appended comment form */
    post_item_clone.find(".comment_form").on("submit", submitCommentForm);
  
    /** Bind keyup event to appended comment form textarea */
    post_item_clone.find("textarea").on("keyup", textareaKeyUp);
  
    /** Clear the wall post form */
    write_post_form.get().reset();
  }
  return false;
}

function submitCommentForm(event){
  event.preventDefault();
  let comment_form = v88(event.target);

  if(comment_form.find(".comment_content").get().value.length){
    let post_comment_item = comment_form.getParent();
    let comment_item_clone = (post_comment_item.hasClass("wall_post_item")) ? v88(".comment_item_clone").copy() : v88(".reply_item_clone").copy();
    comment_item_clone.removeClass("comment_item_clone");
    comment_item_clone.removeClass("reply_item_clone");
    post_comment_item.find(".comments_list").append(comment_item_clone);
  
    comment_item_clone.find(".comment_content").text(comment_form.find(".comment_content").get().value);
    comment_item_clone.find("textarea").get() && comment_item_clone.find("textarea").on("keyup", textareaKeyUp);
    comment_item_clone.find(".comment_form").get() && comment_item_clone.find(".comment_form").on("submit", submitCommentForm);

    comment_form.get().reset();
  }

  return false;
}

function textareaKeyUp(event){
  let textarea_field = v88(event.target);

  if(event.keyCode === 13){
    (textarea_field.get().value.trim().length) && textarea_field.getParent().trigger("submit");

    let text_value = textarea_field.get().value;
    textarea_field.get().value = text_value.substr(0, text_value.length - 1);
  }
};