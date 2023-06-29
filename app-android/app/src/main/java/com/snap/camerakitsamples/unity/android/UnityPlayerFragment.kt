package com.snap.camerakitsamples.unity.android

import android.graphics.Color
import android.graphics.drawable.ColorDrawable
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.FrameLayout
import androidx.fragment.app.DialogFragment
import com.unity3d.player.UnityPlayer
import com.fictionalcompany.mygame.R

class UnityPlayerFragment : DialogFragment(R.layout.fragment_unity_player) {
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
        val view : FrameLayout = inflater.inflate(R.layout.fragment_unity_player, container, false) as FrameLayout

        view.addView(mUnityPlayer.view, FrameLayout.LayoutParams.MATCH_PARENT, FrameLayout.LayoutParams.MATCH_PARENT)

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