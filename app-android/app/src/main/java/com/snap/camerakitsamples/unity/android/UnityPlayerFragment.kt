package com.snap.camerakitsamples.unity.android

import android.graphics.Color
import android.graphics.drawable.ColorDrawable
import android.opengl.GLSurfaceView
import android.os.Bundle
import android.view.LayoutInflater
import android.view.Surface
import android.view.SurfaceView
import android.view.View
import android.view.ViewGroup
import android.view.WindowManager
import android.widget.FrameLayout
import androidx.camera.core.impl.utils.ContextUtil
import androidx.fragment.app.DialogFragment
import androidx.fragment.app.Fragment
import com.snap.camerakitsamples.unity.android.R.layout.fragment_unity_player
import com.unity3d.player.UnityPlayer
import com.unity3d.player.UnityPlayerActivity

class UnityPlayerFragment : DialogFragment(fragment_unity_player) {
    lateinit var mUnityPlayer: UnityPlayer;
    lateinit var fl_forUnity : FrameLayout;

    override fun onStart() {
        super.onStart()
        setWindowParams()
    }

    private fun setWindowParams(){
        dialog?.window?.setBackgroundDrawable(ColorDrawable(Color.TRANSPARENT))
        dialog?.window?.setLayout(
            FrameLayout.LayoutParams.MATCH_PARENT,
            FrameLayout.LayoutParams.MATCH_PARENT
        )
    }

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        super.onCreateView(inflater, container, savedInstanceState)

        mUnityPlayer = UnityPlayer(activity)
        val view : FrameLayout = inflater.inflate(fragment_unity_player, container, false) as FrameLayout
//        fl_forUnity = view.findViewById(R.layout.fragment_unity_player) as FrameLayout

        view.addView(mUnityPlayer.view, FrameLayout.LayoutParams.MATCH_PARENT, FrameLayout.LayoutParams.MATCH_PARENT)

//        view.apply {
//            alpha = 0.5f
//        }
//        mUnityPlayer.apply {
//            alpha = 0.5f
//        }
//        view.findViewById<SurfaceView>(R.id.unitySurfaceView).apply {
//            alpha = 0.5f
//        }

        mUnityPlayer.requestFocus()
        mUnityPlayer.windowFocusChanged(true)

        return view
    }

    override fun onDestroy() {
        mUnityPlayer.quit()
        super.onDestroy()
    }

    override fun onPause() {
        super.onPause()
        mUnityPlayer.pause()
    }

    override fun onResume() {
        super.onResume()
        mUnityPlayer.resume()
    }

}