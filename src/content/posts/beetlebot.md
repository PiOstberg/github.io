---
title: 'Beetlebot'
date: 2023-12-22T00:00:00+01:00
image: 'beetlebot.png'
draft: false
summary: 'Clear out the ant infestation using the latest in robot beetle technology'
tags: ['Game', 'C++']
params:
    description: 'small dungeon crawler with even smaller enemies'
---

Beetlebot is a 4 level dungeon crawler. It was our first game project at PlaygroundSquad and made in the game engine TenGine.  
I was tasked with building most of the core systems powering the game, such as the physics, collision detection, enemy pathfinding, as well as providing platform support for the PlayStation 5.

---
## Pathfinding
Early pathfinding test with a navmesh. Early on it was just a basic floodfill algorithm  
![](/images/beetlebot-pathfinding.gif)

---
## Entity Collisions
Playing around with entity to entity collisions. Notice how ants are able to run into and over eachother  
![](/images/beetlebot-collision.png)

---
## Pathfinding & Collision Stress Test
The grid shown is an optimization to reduce the amount of navmesh lookups. 
<div style="max-width: 720px"> 
    <video controls style="object-fit: cover; width: 100%;">
    <source src="/videos/beetlebot-stresstesting.mp4" type="video/mp4"> Your browser does not support the video tag. </video>
</div>
---
## Video Playback System (sound warning)
Test of the video playback system implemented on Windows. It was relatively easy to port it to the PlayStation 5 with minimal stutter.  
<sup>I claim no ownership of the Aperture logo. All rights go to The Valve Corporation</sup>  
<div style="max-width: 720px">
    <video controls style="object-fit: cover; width: 100%;">
    <source src="/videos/beetlebot-video-player.mp4" type="video/mp4"> Your browser does not support the video tag. </video>
</div>
