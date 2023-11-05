---
title: Contact Information
navTitle: Contact Us
order: 60
description: Need to reach out to us? This is the place!
headerImage: /static/media/contact-debby-hudson-dr31squbfoa-unsplash.jpg
---

Join our [Scottsdale Dog Fanciers Association Group](https://www.facebook.com/groups/151412575520389) on Facebook!

{# We _don't_ want the Gmail here... just the form! #}
{# ​Or, you can email us at: [scottsdaledogfanciersassn@gmail.com](mailto:scottsdaledogfanciersassn@gmail.com) #}

<form name="contact" class="form-default" method="POST" data-netlify="true">
    <label for="name"
      >Name<input
        type="text"
        required
        name="name"
        id="name"
        placeholder="Your Name"
    ></label>

    <label for="email"
      >Email<input
        type="email"
        required
        name="email"
        id="email"
        placeholder="you@your-email.com"
    ></label>

    <label for="email"
      >Comment/Question<textarea
        required
        name="comment"
        id="comment"
        rows="5"
        placeholder="I have a question about ..."
    ></label>

    <input type="submit">
</form>
