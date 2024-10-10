---
title: 'Beetlebot'
date: 2023-12-22T00:00:00+01:00
image: 'beetlebot.png'
draft: false
summary: 'Third person physics 4-level dungeon crawler'
tags: ['Game', 'C++']
params:
    description: 'small dungeon crawler with even smaller enemies'
---

Beetlebot is a 4 level dungeon crawler. It was our first game project at PlaygroundSquad and made in the game engine TenGine.  
I was tasked with building most of the core systems powering the game, such as the physics, collision detection, enemy pathfinding, as well as providing platform support for the PlayStation 5.

For this project I implemented :
* Physics and Collisions
* Pathfinding
* PlayStation®5 DualSense Haptic Feedback
* Video Playback
* Miscellaneous entity systems


<div class="video-container">
    <div class="auto-resizable-iframe">
        <div><iframe frameborder="0" allowfullscreen="" src="https://www.youtube.com/embed/G-td76fZ01g?si=Ianls67Zz_aBeXAx"></iframe></div>
    </div>
    <div class="auto-resizable-iframe">
        <div><iframe frameborder="0" allowfullscreen="" src="https://www.youtube.com/embed/W5Uf3M3wklg?si=CCXDGPvOXxBachXq"></iframe></div>
    </div>
</div>

---

## Collisions System

Entity-Entity and Entity-Environment collisions.

![](/images/beetlebot-collision.png)

Entity to Entity collision was done using basic sphere colliders applying forces to each other. Optimized with chunks to avoid unnecessary checks.

Entity to environment collision was done in a way I developed myself to match the limitations of the engine. Because there is no built in physics in TenGine 5, I resorted to using the navmesh as both the floor and wall collider. Which when optimized could easily handle a few thousand entities.

For each entity, the system checks two things
1. if the entity is standing on the navmesh
2. if 1 is false; if the entity is above the navmesh by any distance

if both are false, the entity is outside the navmesh bounds, i.e colliding with a wall.

This posed some limitations of course, a major one being that levels couldn't have walls above another surface. Our level designers worked around that limitation.

---

## Masse Pathfinding
The navigation used a somewhat naive approach to A* pathfinding, simply because it was something I hadn't previously worked with. But with chunking and reusing paths from nearby entities it didn't pose a serious bottleneck for performance, allowing at least 1500 entities simultaneously.  

![](/images/beetlebot-pathfinding.gif)  
<sup>Early pathfinding test with a navmesh. Early on it was just a basic floodfill algorithm</sup>

<div style="max-width: 720px"> 
    <video controls style="object-fit: cover; width: 100%;">
    <source src="/videos/beetlebot-stresstesting.mp4" type="video/mp4"> Your browser does not support the video tag. </video>
</div>
<sup>The grid shown is an optimization to reduce the amount of navmesh lookups. </sup>

### cNavmesh.cpp snippet
<details>
<summary>Click to expand</summary>

```cpp
int cNavmesh::getNodeClosestToPosition( const tg::cVector3f& _position )
{
	unsigned int closest   = 0;
	float closest_distance = 100000.0f;

	int chunk_pos = worldToChunkIndex( _position );

	if ( chunk_pos.y < 0 || chunk_pos.y >= m_chunk_count || chunk_pos.x < 0 || chunk_pos.x >= m_chunk_count )
		return -1;

	std::vector<unsigned int>& chunk = m_node_chunks[ chunk_pos.y ][ chunk_pos.x ];

	for ( size_t i = 0; i < chunk.size(); i++ )
	{
		float distance = ( m_nodes[ chunk[ i ] ].position - _position ).length();

		if ( distance > closest_distance )
			continue;

		closest_distance = distance;
		closest = (unsigned int)chunk[ i ];
	}

	return closest;
}
```

</details>

---

## Video Playback System (sound warning)

For the intro sequences of Beetlebot I implemented a rudimentary video playback system. Because of time constraints I couldn't port port an entire video library to the PlayStation 5, so the solution I wrote uses a series of raw textures. Not optimal but it did the job for the few seconds it was visible in game.  
<sup>I claim no ownership of the Aperture logo. All rights go to The Valve Corporation</sup>  

<div style="max-width: 720px">
    <video controls style="object-fit: cover; width: 100%;">
    <source src="/videos/beetlebot-video-player.mp4" type="video/mp4"> Your browser does not support the video tag. </video>
</div>
