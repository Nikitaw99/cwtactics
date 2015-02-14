package org.wolfTec.cwt.game;

public abstract class EngineGlobals {

  /**
   * Current version of the running CustomWars: Tactics.
   */
  public static final String VERSION = "0.3.799-b1";

  /**
   * Symbol of inactive items.
   */
  public static final int INACTIVE_ID = -1;

  /**
   * Amount of capture points that needs to be lowered by a capturer to
   * completely capture property.
   */
  public static final int CAPTURE_POINTS = 20;

  /**
   *
   */
  public static final int CAPTURE_PER_STEP = 10;

  /**
   *
   */
  public static final int INPUT_STACK_BUFFER_SIZE = 10;

  /**
   * Determines the debug mode. Can be changed at runtime to enable/disable
   * runtime assertions and debug outputs.
   */
  public static final boolean DEBUG = true;

  /**
   * The game won't cache data when this variable is set to true.
   */
  public static final boolean DEV_NO_CACHE = false;

  /**
   * Name of the font that will be used to render text.
   */
  public static final String GAME_FONT = "Gamefont";

  /**
   * URL of the active server where the game was downloaded from. This server
   * will be used to grab the game data. TODO rename property to SERVER_PATH
   */
  public static final String MOD_PATH = "http://localhost:8000/";

  /**
   *
   */
  public static final String DEFAULT_MOD_PATH = "http://localhost:8000/modifications/cwt.json";

  /**
   * Tile size base.
   */
  public static final int TILE_BASE = 16;

  /**
   * Represents a numeric code which means no data.
   */
  public static final int DESELECT_ID = -2;

  /**
   *
   */
  public static final int NOT_AVAILABLE = -2;

  /**
   * Screen width in tiles.
   */
  public static final int SCREEN_WIDTH = 32;

  /**
   * Screen height in tiles.
   */
  public static final int SCREEN_HEIGHT = 24;

  /**
   * Maximum width of a map.
   */
  public static final int MAX_MAP_WIDTH = 60;

  /**
   * Maximum height of a map.
   */
  public static final int MAX_MAP_HEIGHT = 40;

  /**
   * Maximum range of a move action.
   */
  public static final int MAX_MOVE_LENGTH = 15;

  /**
   * Maximum number of players.
   */
  public static final int MAX_PLAYER = 4;

  /**
   * Maximum number of properties.
   */
  public static final int MAX_PROPERTIES = 200;

  /**
   * Maximum number of units per player.
   */
  public static final int MAX_UNITS = 50;

  /**
   *
   */
  public static final int MAX_SELECTION_RANGE = 15;

  /**
   *
   */
  public static final int ACTION_POOL_SIZE = 200;

  /**
   * 
   */
  public static final int NETWORKBEAN_BUFFER_SIZE = 200;

  public static final int INPUTBEAN_STACK_SIZE = 10;
  public static final int INPUTBEAN_BUFFER_SIZE = 10;

  /**
   *
   */
  public static final int ANIMATION_TICK_TIME = 150;

  /**
   * 
   */
  public static final int MENU_ELEMENTS_MAX = 10;

  public static final int START_SCREEN_TOOLTIP_TIME = 5000;

  /**
   * 
   */
  public static final String CONFIRM_UNSUPPORTED_SYSTEM_MESSAGE = "Your system isn't supported by CW:T. Try to run it anyway?";

  /**
     *
     */
  public static final String CANNON_UNIT_INV = "CANNON_UNIT_INV";

  /**
     *
     */
  public static final String LASER_UNIT_INV = "LASER_UNIT_INV";

  /**
     *
     */
  public static final String PROP_INV = "PROP_INV";

  /**
  *
  */
  public static final String NO_MOVE = "NO_MOVE";

  // ====================== STORAGE PARAMETER NAMES ======================

  public static final String STORAGE_PARAMETER_CACHED_CONTENT = "cwt_gameContent_cached";
  public static final String STORAGE_PARAMETER_MAP_PREFIX = "cwt_map_";
  public static final String STORAGE_PARAMETER_IMAGE_PREFIX = "cwt_image_";
  public static final String STORAGE_PARAMETER_SAVEGAME_PREFIX = "cwt_savegame_";

  // TODO - BIND THAT 3 CONFIGS TOGETHER ?
  public static final String STORAGE_PARAMETER_INPUT_MAPPING = "cwt_input_mapping";
  public static final String STORAGE_PARAMETER_AUDIO_VOLUME = "cwt_aduio_volume";
  public static final String STORAGE_PARAMETER_APPLICATION_CONFIG = "cwt_app_config";
  // END OF - TODO - BIND THAT 3 CONFIGS TOGETHER ?

  // ====================== STATE NAMES ======================

  public static final String STATE_ERROR = "ERROR";
  public static final String STATE_PORTRAIT = "PORTRAIT";
  public static final String STATE_CHECK_CACHE = "CHECK_CACHE";
  public static final String STATE_GRAB_ASSETS = "GRAB_ASSETS";
  public static final String STATE_LOAD_ASSETS = "LOAD_ASSETS";
  public static final String STATE_VALIDATE_ASSETS = "VALIDATE_ASSETS";
  public static final String STATE_START_SCREEN = "START_SCREEN";
  public static final String STATE_MAIN_MENU = "MAIN_MENU";
  public static final String STATE_GAMEROUND_PARAMETER_SETUP = "GAMEROUND_PARAMETER_SETUP";
  public static final String STATE_GAMEROUND_PLAYER_SETUP = "GAMEROUND_PLAYER_SETUP";
  public static final String STATE_GAMEROUND_SKIRMISH_MAP_SELECT = "GAMEROUND_SKIRMISH_MAP_SELECT";
  public static final String STATE_CONFIRM_WIPEOUT = "CONFIRM_WIPEOUT";
  public static final String STATE_OPTIONS = "OPTIONS";
  public static final String STATE_OPTIONS_REMAP_INPUT = "OPTIONS_REMAP_INPUT";
  public static final String STATE_GAMEROUND_ENTER = "GAMEROUND_ENTER";
  public static final String STATE_GAMEROUND_EXIT = "GAMEROUND_EXIT";
  public static final String STATE_FLUSH_ACTIONS = "FLUSH_ACTIONS";
  public static final String STATE_IDLE = "IDLE";
  public static final String STATE_MULTISTEP = "MULTISTEP";
  public static final String STATE_GAMEROUND_MENU = "MENU";
  public static final String STATE_GAMEROUND_SUB_MENU = "SUB_MENU";
  public static final String STATE_GAMEROUND_MOVEPATH = "MOVEPATH";
  public static final String STATE_GAMEROUND_SELECT_TARGET = "SELECT_TARGET";
  public static final String STATE_GAMEROUND_SHOW_ATTACK_RANGE = "SHOW_ATTACK_RANGE";
  public static final String STATE_ANIMATION_CAPTURE = "ANIM_CAPTURE";
  public static final String STATE_ANIMATION_CHANGE_WEATHER = "ANIM_CHANGE_WEATHER";
  public static final String STATE_ANIMATION_EXPLOSION_GROUND = "ANIM_EXPLOSION_GROUND";
  public static final String STATE_ANIMATION_UNIT_MOVE = "ANIM_UNIT_MOVE";
  public static final String STATE_ANIMATION_NEXT_TURN = "ANIM_NEXT_TURN";
  public static final String STATE_ANIMATION_BALLISTIC_FIRE = "ANIM_BALLISTIC_FIRE";
  public static final String STATE_ANIMATION_LASER_FIRE = "ANIM_LASER_FIRE";
  public static final String STATE_ANIMATION_TRAPPED = "ANIM_TRAPPED";
}
