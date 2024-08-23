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

## Entity Collisions

Entity-Entity and Entity-Static World collisions.

![](/images/beetlebot-collision.png)

The collision code is some 600 lines of code so I won't post that here

---

## Masse Pathfinding
![](/images/beetlebot-pathfinding.gif)  
<sup>Early pathfinding test with a navmesh. Early on it was just a basic floodfill algorithm</sup>

<div style="max-width: 720px"> 
    <video controls style="object-fit: cover; width: 100%;">
    <source src="/videos/beetlebot-stresstesting.mp4" type="video/mp4"> Your browser does not support the video tag. </video>
</div>
<sup>The grid shown is an optimization to reduce the amount of navmesh lookups. </sup>

### cNavmesh.cpp
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

---

## Video Playback System (sound warning)

Test of the video playback system implemented on Windows. It was relatively easy to port it to the PlayStation 5 with minimal stutter.  
<sup>I claim no ownership of the Aperture logo. All rights go to The Valve Corporation</sup>  

<div style="max-width: 720px">
    <video controls style="object-fit: cover; width: 100%;">
    <source src="/videos/beetlebot-video-player.mp4" type="video/mp4"> Your browser does not support the video tag. </video>
</div>

### cVideo.cpp
```cpp
cVideo::cVideo( const std::string& _filename )
{
    std::string dir_path      = "data/videos/" + _filename + "/";
    std::string frames_path   = dir_path + "frames/";
    std::string settings_path = dir_path + "movie-settings.json";
    uint8_t* data = tg::cFileSystem::getInstance().fileLoad( settings_path );

    if ( !data ) // failed to load settings
        return;

    nlohmann::json json_root = nlohmann::json::parse( data );
    TG_MEMORY_FREE( data );

    m_framerate = json_root.value( "framerate", 24.0f );

    std::string audio_path = json_root.value( "audio", "" );

    loadFrameList( dir_path );
    loadFrames();
    catchFrames();

    if( audio_path != "" )
        m_audio = cAudio::getInstance().createAudioFile( dir_path + audio_path );

    m_sprite = new tg::cSprite();
    m_sprite->create( _name, { 1920.0f / 1.0f, 1080.0f / 2.0f, 0 }, { 1920, 1080 }, tg::Color::kWhite, nullptr );
    m_sprite->setTexCoords( 1.0f, 0.0f, 1.0f, 0.0f );
}
```
