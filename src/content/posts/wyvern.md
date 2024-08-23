---
title: 'Wyvern'
date: 2024-06-14T00:00:00+01:00
image: 'wyvern.png'
draft: false
summary: 'Cross-Platform C++ Game Engine'
tags: ['C++', 'Engine']
params:
    description: 'One Engine, Some Platforms'
---

<style>
table, th, td {
  border:1px dotted #F3F5F6;
  border-collapse: collapse;
}
th, td {
  padding: 4px;
}
</style>

Wyvern is a 3D game engine developed from scratch by me.  
Its main goal is for me to learn about how engines function, but also to act as my main game engine because of my disappointment in already existing ones, such as Unity or Unreal Engine.

The source can be found on [the github repository](https://github.com/argoreofficial/wyvern). NDA bound platform-specific code is kept on a private server.  
This page will only outline some core features and explanations for certain design decisions.

Libraries and frameworks Wyvern uses:

| Library                                               | Use             | Platforms | 
|-------------------------------------------------------|-----------------|-----------|
| [GLFW](https://www.glfw.org)                          | Window Handling | Windows   |
| [SDL](https://www.libsdl.org)                         | Window Handling | All       |
| [GLM](https://github.com/g-truc/glm)                  | Matrix Maths    | All       |
| [Assimp](https://github.com/assimp/assimp)            | Model Parsing   | All       |
| [stb_image](https://github.com/nothings/stb)          | Image Parsing   | All       |
| [ImGUI](https://github.com/ocornut/imgui)             | Debug UI        | All       |
| [JoltPhysics](https://github.com/jrouwe/JoltPhysics/) | Physics         | Windows   |
| [MiniAudio](https://miniaud.io)                       | Audio           | All       |
| [nlohmann::json](https://github.com/nlohmann/json)    | json parsing    | All       | 

## XMake Build Tool
The first thing to talk about is the build tool. Wyvern uses [XMake](https://xmake.io/), an open source Lua based build tool.  
It's my favourite build tool for a number of reasons, most notably because of how easy to use and set up it is.

## Platforms
The aim is to support Windows, Linux, Android, and some consoles (Nintendo 3DS, PlayStation, etc.). Currently it's only been tested on Windows and WASM.

Using XMake I built up a relatively straight forward platforming-system that allows me to easily add more platforms and pick what it supports.
Eg. Windows supports both GLFW and SDL, while WASM only supports SDL.

## The Engine
Wyvern uses a configuration setup, where the developer implements the `wv::iApplication` interface. This is used to set up and configure the engine and it's subsystems, as well as inform the reflection system about any custom classes they may have implemented. Ownership of everything is then passed to the engine.

A typical application implementation looks something like this;

### MyApplication.h
```cpp
#pragma once

#include <wv/Engine/Application.h>

class cMyApplication : public wv::iApplication
{
public:
	cMyApplication() { }

	// Inherited via iApplication
	bool create ( void ) override;
	void run    ( void ) override;
	void destroy( void ) override;
};

```

### MyApplication.cpp

```cpp
bool cMyApplication::create( void )
{
	wv::EngineDesc engineDesc;
	engineDesc.windowWidth  = 1280;
	engineDesc.windowHeight = 960;
	engineDesc.showDebugConsole = true;

	// create device context
	wv::ContextDesc ctxDesc;
	ctxDesc.deviceApi   = wv::WV_DEVICE_CONTEXT_API_GLFW;
	ctxDesc.graphicsApi = wv::WV_GRAPHICS_API_OPENGL;
	ctxDesc.graphicsApiVersion.major = 3;
	ctxDesc.graphicsApiVersion.minor = 1;
	
    ctxDesc.name   = "Wyvern Sandbox";
	ctxDesc.width  = engineDesc.windowWidth;
	ctxDesc.height = engineDesc.windowHeight;

	ctxDesc.allowResize = false;

	wv::iDeviceContext* deviceContext = wv::iDeviceContext::getDeviceContext( &ctxDesc );
	deviceContext->setSwapInterval( 0 ); // disable vsync
	
	// create graphics device
	wv::GraphicsDeviceDesc deviceDesc;
	deviceDesc.loadProc = deviceContext->getLoadProc();
	deviceDesc.pContext = deviceContext;
	
	wv::iGraphicsDevice* graphicsDevice = wv::iGraphicsDevice::createGraphicsDevice( &deviceDesc );

	engineDesc.device.pContext  = deviceContext;
	engineDesc.device.pGraphics = graphicsDevice;
	engineDesc.device.pAudio    = new wv::AudioDevice( nullptr );
	
	// set up modules
    wv::cFileSystem* fileSystem = new wv::cFileSystem();
	fileSystem->addDirectory( L"res/" );
	fileSystem->addDirectory( L"res/materials/" );
	fileSystem->addDirectory( L"res/meshes/" );
	fileSystem->addDirectory( L"res/shaders/" );
	fileSystem->addDirectory( L"res/textures/" );

	engineDesc.systems.pFileSystem = fileSystem;
	engineDesc.systems.pShaderRegistry = new wv::cShaderRegistry( engineDesc.systems.pFileSystem, graphicsDevice );
	
	// setup application state and scenes
	wv::cApplicationState* appState = new wv::cApplicationState();
	engineDesc.pApplicationState = appState;

	wv::cSceneRoot* scene = appState->loadScene( fileSystem, "res/scenes/defaultScene.json" );
	appState->addScene( scene );

	// create engine
	m_pEngine = new wv::cEngine( &engineDesc );

    return true;
}
```